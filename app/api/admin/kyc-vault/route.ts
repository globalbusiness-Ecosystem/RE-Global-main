import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { adminDb } from '@/lib/firebase-admin';
import { vaultKey, encryptField, isEncrypted, idFingerprint, decryptField } from '@/lib/field-crypto';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Vault status: is the encryption key set, and how many identity records / photos are still stored as plain text.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const [kyc, files] = await Promise.all([adminDb.collection('kyc').limit(500).get(), adminDb.collection('kyc_files').limit(500).get()]);
  const plainKyc = kyc.docs.filter((d) => d.data().idNumber && !isEncrypted(d.data().idNumber)).length;
  const plainFiles = files.docs.filter((d) => typeof d.data().data === 'string' && !isEncrypted(d.data().data)).length;
  return NextResponse.json({ ok: true, keyConfigured: !!vaultKey(), kyc: kyc.size, plainKyc, files: files.size, plainFiles }, { headers: H });
}

// Encrypts what is still plain (safe to repeat). Needs KYC_ENC_KEY.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const key = vaultKey();
  if (!key) return NextResponse.json({ ok: false, error: 'KYC_ENC_KEY is not set' }, { status: 400, headers: H });
  try {
    let kycDone = 0, filesDone = 0;
    const kyc = await adminDb.collection('kyc').limit(500).get();
    for (const d of kyc.docs) {
      const x = d.data(), patch: Record<string, unknown> = {};
      if (x.idNumber && !isEncrypted(x.idNumber)) {
        patch.idNumber = encryptField(String(x.idNumber), key);
        const fp = idFingerprint(String(x.idNumber), key);
        if (fp) patch.idHash = fp;
      } else if (x.idNumber && !x.idHash) {
        const fp = idFingerprint(decryptField(x.idNumber, key), key);
        if (fp) patch.idHash = fp;
      }
      if (x.phone && !isEncrypted(x.phone)) patch.phone = encryptField(String(x.phone), key);
      if (Object.keys(patch).length) { await d.ref.update(patch); kycDone++; }
    }
    const files = await adminDb.collection('kyc_files').limit(500).get();
    for (const d of files.docs) {
      const v = d.data().data;
      if (typeof v === 'string' && !isEncrypted(v)) { await d.ref.update({ data: encryptField(v, key) }); filesDone++; }
    }
    await logAdmin('kyc.vault.encrypt', { kycDone, filesDone });
    return NextResponse.json({ ok: true, kycDone, filesDone }, { headers: H });
  } catch (err) {
    console.error('[admin/kyc-vault] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H });
  }
}
