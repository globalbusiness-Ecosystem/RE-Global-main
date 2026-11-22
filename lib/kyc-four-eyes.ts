import type { AdminRole } from './admin-roles';

// "Four eyes" on identity decisions: one person recommends, a different person decides.
// Pure rules (no database) so they can be tested and shared by the route and the screen.

export type Decision = 'approved' | 'rejected';
export type Proposal = { decision: Decision; reason: string; by: string; byName: string; at: string | null };
export type Step = 'apply' | 'propose';

export const cleanFourEyes = (v: unknown): { enabled: boolean } => ({ enabled: (v as { enabled?: unknown } | null)?.enabled !== false }); // on unless switched off

/**
 * What happens when `actor` (with `role`) submits a decision.
 * - the owner always decides (the owner is the last authority; the audit log records it);
 * - a reviewer can only recommend;
 * - with four eyes on, anyone else decides only on top of ANOTHER person's recommendation; otherwise their decision is a recommendation;
 * - with four eyes off, a compliance officer decides directly.
 */
export function nextStep(o: { enabled: boolean; role: AdminRole; actor: string; proposal: Pick<Proposal, 'by'> | null }): Step {
  if (o.role === 'owner') return 'apply';
  if (o.role === 'reviewer') return 'propose';
  if (!o.enabled) return 'apply';
  return o.proposal && o.proposal.by !== o.actor ? 'apply' : 'propose';
}
