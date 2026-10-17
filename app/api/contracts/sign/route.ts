import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { resolveExpected, BookingInputError, type Quote } from '@/lib/property-price';
import { confirmBooking } from '@/lib/booking-calendar';
import { confirmShares } from '@/lib/share-inventory';
import { finalizeSale } from '@/lib/property-reserve';
import { getLegalProfile } from '@/lib/legal-server';
import { generateContractText, hashContract, signContractHash } from '@/lib/contract-signing';
import { cleanText, isValidPaymentId, isValidTxid, validatePiPayment, PiPayment } from '@/lib/contract-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const secretKey = process.env.PI_ISSUER_SECRET_KEY;
  const publicKey = process.env.PI_ISSUER_PUBLIC_KEY;
  if (!secretKey || !publicKey || !process.env.PI_API_KEY) {
    return NextResponse.json({ error: 'Platform signing is not configured' }, { status: 500 });
  }

  // 1) Who is calling? Proven by a real Pi access token, not by the request body.
  let user;
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    user = await verifyPiAccessToken(token);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Not authenticated' }, { status });
  }
  const limited = await rateLimited('sign', user.uid, 30, 10 * 60 * 1000);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const paymentId = body.paymentId;
  const txid = body.txid;
  const propertyId = cleanText(body.propertyId, 128);
  if (!isValidPaymentId(paymentId) || !isValidTxid(txid) || !propertyId) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  // 2) Was there a real, completed Pi payment by THIS user for THIS property?
  let payment: PiPayment;
  try {
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Key ${process.env.PI_API_KEY}` },
      cache: 'no-store',
    });
    if (piRes.status === 404) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    if (!piRes.ok) return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 });
    payment = (await piRes.json()) as PiPayment;
  } catch {
    return NextResponse.json({ error: 'Could not reach Pi Platform API' }, { status: 503 });
  }

  let quote: Quote;
  try {
    quote = await resolveExpected(propertyId, payment.metadata, { allowPast: true });
  } catch (e) {
    if (e instanceof BookingInputError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: 'Could not verify the property price' }, { status: 503 });
  }
  const check = validatePiPayment(payment, { uid: user.uid, txid, propertyId, expectedAmount: quote.amount });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status ?? 400 });
  }
  const paidAmount = check.amount as number;
  const paidType = check.type as NonNullable<typeof check.type>;

  // 3) Property title: prefer our own record; fall back to a sanitised client value.
  let propertyTitle = cleanText(body.propertyTitle, 150);
  let propertyCountry = '';
  if (!propertyId.includes('/')) {
    try {
      const snap = await Promise.race([
        adminDb.collection('properties').doc(propertyId).get(),
        new Promise<null>((r) => setTimeout(() => r(null), 3000)),
      ]);
      const t = snap && snap.exists ? cleanText(snap.data()?.title, 150) : '';
      if (t) propertyTitle = t;
      if (snap && snap.exists && typeof snap.data()?.country === 'string') propertyCountry = snap.data()?.country;
    } catch {
      /* use client title */
    }
  }
  if (!propertyTitle) propertyTitle = `Property ${propertyId}`;
  const legal = await getLegalProfile(propertyCountry);

  // 4) One payment -> one signed contract. Repeat calls return the stored one.
  const ref = adminDb.collection('signed_contracts').doc(paymentId);
  // Public, verifiable copy (read by /verify/[id] and the user's Contracts page).
  // Same id as the payment, so this is idempotent too.
  const publicRef = adminDb.collection('contracts').doc(paymentId);
  const toPublicDoc = (r: Record<string, any>) => ({
    propertyId: r.propertyId,
    propertyTitle: r.propertyTitle,
    buyerUsername: r.buyerUsername,
    sellerUsername: 'RE-Global-Platform',
    type: r.type,
    amount: r.amount,
    currency: r.currency,
    status: 'completed',
    paymentId,
    txid: r.txid ?? txid,
    contractText: r.contractText,
    contractHash: r.contractHash,
    platformSignature: r.platformSignature,
    platformPublicKey: r.platformPublicKey,
    signedAt: r.signedAt,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const publicSnap = await tx.get(publicRef);
      if (snap.exists) {
        const d = snap.data()!;
        if (d.uid !== user.uid) return { conflict: true as const };
        if (!publicSnap.exists) tx.set(publicRef, toPublicDoc(d));
        return { record: d };
      }
      const contractId = `${paymentId}-${Date.now().toString(36)}`;
      const contractText = generateContractText({
        contractId,
        propertyId,
        propertyTitle,
        buyerUsername: user.username,
        sellerUsername: 'RE-Global-Platform',
        type: paidType,
        amount: paidAmount,
        currency: 'Pi',
        paymentId,
        txid,
        booking: quote.booking ? { start: quote.booking.start, end: quote.booking.end, nights: quote.booking.nights } : undefined,
        shares: quote.shares ? { count: quote.shares.count, totalShares: quote.shares.totalShares } : undefined,
        legal: { statusLine: legal.statusLine, governingLaw: legal.governingLaw, extraClause: legal.extraClause },
      });
      const contractHash = hashContract(contractText);
      const record = {
        uid: user.uid,
        contractId,
        contractText,
        contractHash,
        platformSignature: signContractHash(contractHash, secretKey),
        platformPublicKey: publicKey,
        signedAt: new Date().toISOString(),
        buyerUsername: user.username,
        amount: paidAmount,
        currency: 'Pi',
        type: paidType,
        propertyId,
        propertyTitle,
        txid,
      };
      tx.set(ref, record);
      tx.set(publicRef, toPublicDoc(record));
      return { record };
    });

    if ('conflict' in result) {
      return NextResponse.json({ error: 'Payment already used' }, { status: 409 });
    }
    // Mark the property sold and record the owner (idempotent; a failure makes the client retry the whole call).
    if (quote.shares) {
      await confirmShares({
        propertyId, uid: user.uid, username: user.username, paymentId,
        contractId: String((result.record as Record<string, unknown>).contractId ?? ''),
        propertyTitle, propertyType: quote.shares.type, count: quote.shares.count, totalShares: quote.shares.totalShares, amount: paidAmount,
      });
    }
    if (quote.booking) {
      await confirmBooking({
        propertyId, uid: user.uid, username: user.username, paymentId,
        contractId: String((result.record as Record<string, unknown>).contractId ?? ''),
        propertyTitle, propertyType: quote.booking.type, start: quote.booking.start, end: quote.booking.end,
        nights: quote.booking.nights, amount: paidAmount,
      });
    }
    await finalizeSale({
      propertyId,
      uid: user.uid,
      username: user.username,
      paymentId,
      contractId: String((result.record as Record<string, unknown>).contractId ?? ''),
      propertyTitle,
      amount: paidAmount,
      currency: 'Pi',
    });
    const { uid: _uid, ...publicRecord } = result.record as Record<string, unknown>;
    return NextResponse.json({ ...publicRecord, contractDocId: paymentId });
  } catch (e) {
    console.error('[contracts/sign] error:', e);
    return NextResponse.json({ error: 'Signing failed' }, { status: 500 });
  }
}
