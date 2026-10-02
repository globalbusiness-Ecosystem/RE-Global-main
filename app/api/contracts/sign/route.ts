import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
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

  const check = validatePiPayment(payment, { uid: user.uid, txid, propertyId });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status ?? 400 });
  }
  const paidAmount = check.amount as number;
  const paidType = check.type as NonNullable<typeof check.type>;

  // 3) Property title: prefer our own record; fall back to a sanitised client value.
  let propertyTitle = cleanText(body.propertyTitle, 150);
  if (!propertyId.includes('/')) {
    try {
      const snap = await Promise.race([
        adminDb.collection('properties').doc(propertyId).get(),
        new Promise<null>((r) => setTimeout(() => r(null), 3000)),
      ]);
      const t = snap && snap.exists ? cleanText(snap.data()?.title, 150) : '';
      if (t) propertyTitle = t;
    } catch {
      /* use client title */
    }
  }
  if (!propertyTitle) propertyTitle = `Property ${propertyId}`;

  // 4) One payment -> one signed contract. Repeat calls return the stored one.
  const ref = adminDb.collection('signed_contracts').doc(paymentId);
  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) {
        const d = snap.data()!;
        return d.uid === user.uid ? { record: d } : { conflict: true as const };
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
      };
      tx.set(ref, record);
      return { record };
    });

    if ('conflict' in result) {
      return NextResponse.json({ error: 'Payment already used' }, { status: 409 });
    }
    const { uid: _uid, ...publicRecord } = result.record as Record<string, unknown>;
    return NextResponse.json(publicRecord);
  } catch (e) {
    console.error('[contracts/sign] error:', e);
    return NextResponse.json({ error: 'Signing failed' }, { status: 500 });
  }
}
