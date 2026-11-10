// How a card buyer is named inside a contract. The person chooses on the verification page:
//  - "alias": the unique account name plus the personal invite code (the legal name stays private with the platform)
//  - "real":  the legal name from the identity check is written in the contract
// Contracts are public (anyone with the link can open one), so "alias" is the default for new contracts.
export type NameMode = 'real' | 'alias';

export const parseNameMode = (v: unknown): NameMode => (v === 'real' ? 'real' : 'alias');

/** The personal invite code of an account name. Same formula the referral page has always used, so the code never changes. */
export function referralCodeOf(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

const KYC = "identity verified by the Platform's KYC/AML review";

/** The Party A line of a card contract. Without a name mode it reads exactly as it always did (real name). */
export function cardParty(handle: string, card: { buyerName: string; nameMode?: NameMode; inviteCode?: string }): string {
  if (card.nameMode === 'alias') return `@${handle}${card.inviteCode ? ` (personal invite code ${card.inviteCode})` : ''} — ${KYC} (legal name held privately by the Platform)`;
  return `@${handle} — ${KYC} (name on record: ${card.buyerName})`;
}
