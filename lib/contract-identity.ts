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

export type BuyerDisplay = { kind: 'name' | 'code'; value: string };

/** What the contract text says about the buyer: the legal name (real-name choice) or the invite code (alias choice). Null for Pi contracts. */
export function buyerDisplayFromText(text: string | undefined): BuyerDisplay | null {
  const line = /^Party A \([^)]*\): (.*)$/m.exec(text ?? '')?.[1] ?? '';
  const name = /\(name on record: ([^)\n]{1,100})\)/.exec(line)?.[1]?.trim();
  if (name) return { kind: 'name', value: name };
  const code = /\(personal invite code ([A-Z0-9]{1,16})\)/.exec(line)?.[1];
  return code ? { kind: 'code', value: code } : null;
}

/** The username written in the Party A line (what the buyer chose, or the account name). Null when the text has no such line. */
export const buyerHandleFromText = (text: string | undefined): string | null => /^Party A \([^)]*\): @(\S+)/m.exec(text ?? '')?.[1] ?? null;

/** True when the contract text says the buyer paid by card (so "verified via Pi payment" would be wrong). */
export const isCardContractText = (text: string | undefined): boolean => /by card through the Platform's payment provider/.test(text ?? '');

const KYC = "identity verified by the Platform's KYC/AML review";

/** The Party A line of a card contract. Without a name mode it reads exactly as it always did (real name). */
export function cardParty(handle: string, card: { buyerName: string; nameMode?: NameMode; inviteCode?: string }): string {
  if (card.nameMode === 'alias') return `@${handle}${card.inviteCode ? ` (personal invite code ${card.inviteCode})` : ''} — ${KYC} (legal name held privately by the Platform)`;
  return `@${handle} — ${KYC} (name on record: ${card.buyerName})`;
}
