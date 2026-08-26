import { NextRequest, NextResponse } from 'next/server';
import { generateContractText, hashContract, signContractHash } from '@/lib/contract-signing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, propertyId, propertyTitle, buyerUsername, sellerUsername, type, amount, currency, paymentId, txid } = body;

    if (!contractId || !propertyId || !buyerUsername || !paymentId || !txid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secretKey = process.env.PI_ISSUER_SECRET_KEY;
    const publicKey = process.env.PI_ISSUER_PUBLIC_KEY;
    if (!secretKey || !publicKey) {
      return NextResponse.json({ error: 'Platform signing key not configured' }, { status: 500 });
    }

    const contractText = generateContractText({
      contractId, propertyId, propertyTitle, buyerUsername,
      sellerUsername: sellerUsername || 'RE-Global-Platform',
      type, amount, currency, paymentId, txid,
    });

    const contractHash = hashContract(contractText);
    const platformSignature = signContractHash(contractHash, secretKey);

    return NextResponse.json({
      contractText,
      contractHash,
      platformSignature,
      platformPublicKey: publicKey,
      signedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('[contracts/sign] error:', e);
    return NextResponse.json({ error: e?.message || 'Signing failed' }, { status: 500 });
  }
}
