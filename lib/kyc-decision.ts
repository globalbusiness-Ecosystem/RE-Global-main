import 'server-only';
import { decideKyc } from '@/lib/kyc-store';
import { deleteKycFiles } from '@/lib/kyc-files-store';
import { logAdmin } from '@/lib/admin-audit';
import { notifyKycDecision } from '@/lib/kyc-notify';

/** One place for what follows a decision, whoever made it (the team, or an identity company's callback). */
export async function applyKycDecision(uid: string, decision: 'approved' | 'rejected', reason: string, by: string): Promise<{ code: 200 | 404 | 409; mailed: boolean }> {
  const code = await decideKyc(uid, decision, reason);
  if (code !== 200) return { code, mailed: false };
  // A rejected person sends fresh photos with the next request, so the old ones are not kept.
  if (decision === 'rejected') await deleteKycFiles(uid).catch(() => {});
  await logAdmin(`kyc.${decision}`, { uid, reason, by });
  return { code, mailed: await notifyKycDecision(uid, decision, reason) };
}
