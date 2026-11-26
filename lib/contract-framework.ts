import { generateContractText, generateResaleContractText } from '@/lib/contract-signing';

// RE Global Contract Framework: one library of clauses, one template per kind of deal.
//
// Rules this file keeps:
//  - Everything before "TERMS" (title, status, ids, PARTIES, SUBJECT) is produced by the original generators, so the
//    parsers and the public verify page keep working unchanged. Only the TERMS section is new.
//  - Contracts that were already signed are never rewritten: their stored text and hash stay as they are.
//  - The text is English (the signed original). It says so, and the translated view shows the English terms.
//  - It states no legal conclusion the platform cannot back (no "compliant", no "guaranteed", no certified status).
//    The pilot-phase clause stays until counsel confirms the contract can be final.
//  - `basis` lists the international references each clause was written against, for counsel to check. It is not
//    printed in the contract and it is not a claim of compliance.

export const FRAMEWORK_VERSION = '1.0';
export const FRAMEWORK_MARKER = 'Framework: RE Global Contract Framework v';

export type FrameworkKind = 'sale' | 'invest' | 'rent' | 'hotel' | 'resale';
export const FRAMEWORK_KINDS: FrameworkKind[] = ['sale', 'invest', 'rent', 'hotel', 'resale'];
export type Rail = 'pi' | 'card';

export type FrameworkParams = {
  kind: FrameworkKind;
  rail: Rail;
  governingLaw: string;
  extraClause?: string;
  /** The listing says the offering follows Shariah-aligned principles (see the Shariah clause). */
  shariah?: boolean;
  currency: string;
  amount: number;
  /** Pi payment / card order references, as the existing clauses print them. */
  paymentId: string;
  txid: string;
  orderId?: string;
  /** Resale only. */
  resale?: { fee: number; proceeds: number };
  hasInspection?: boolean;
};

export type Clause = {
  id: string;
  title: string;
  kinds: FrameworkKind[] | 'all';
  basis: string[];
  body: (p: FrameworkParams) => string;
  /** Printed only when this returns true (default: always, for the kinds above). */
  when?: (p: FrameworkParams) => boolean;
};

const EC = ['UNCITRAL Model Law on Electronic Commerce (1996)', 'UNCITRAL Model Law on Electronic Signatures (2001)', 'eIDAS Regulation (EU) 910/2014', 'US ESIGN Act and UETA'];
const CONTRACT = ['UNIDROIT Principles of International Commercial Contracts (2016)'];
const CONSUMER = ['EU Consumer Rights Directive 2011/83/EU (information and withdrawal)', 'UN Guidelines for Consumer Protection', 'OECD Recommendation on Consumer Protection in E-commerce'];
const DATA = ['GDPR (EU) 2016/679, arts 5, 6, 13, 15 to 17', 'Egypt Personal Data Protection Law No. 151 of 2020'];
const ASSETS = ['IOSCO Principles of Securities Regulation (disclosure, conflicts)', 'IOSCO policy recommendations for crypto and digital assets', 'EU MiCA Regulation (EU) 2023/1114 (disclosure principles)'];
const AML = ['FATF Recommendation 10 (customer due diligence)', 'FATF Recommendation 15 (virtual assets)', 'UN Security Council and OFAC sanctions programmes'];
const SHARIAH = ["AAOIFI Shari'ah Standard No. 9 (Ijarah)", "AAOIFI Shari'ah Standard No. 12 (Sharikah)", "AAOIFI Shari'ah Standard No. 17 (Investment Sukuk)"];

const money = (p: FrameworkParams) => `${p.amount} ${p.currency}`;

export const CLAUSES: Clause[] = [
  {
    id: 'definitions', title: 'Definitions and interpretation', kinds: 'all', basis: CONTRACT,
    body: () => 'In this contract the "Platform" is RE Global, "Property" is the property named in the Subject above, "Listing" is the description, price and terms published on the Platform for that Property at the time of this transaction, and "Shares" are the fractional interests in a Property that the Platform records in its register. Headings are for convenience only. If this contract and the Listing differ, this contract prevails.',
  },
  {
    id: 'subject-sale', title: 'Subject and rights', kinds: ['sale'], basis: CONTRACT,
    body: () => 'The Buyer purchases, and the Platform transfers, the rights in the Property that the Listing describes. Legal title passes only when the steps the applicable law requires for that Property (such as registration or notarisation) are completed. Until then the Buyer holds the contractual rights recorded on the Platform, and each party will cooperate in good faith to complete those steps.',
  },
  {
    id: 'subject-invest', title: 'Subject and rights attached to Shares', kinds: ['invest'], basis: [...ASSETS, ...CONTRACT],
    body: () => 'The Buyer acquires the number of Shares stated in the Subject. Each Share is a fractional interest in the Property on the terms of the Listing. Unless the Listing says otherwise, a Share carries (a) a pro rata entitlement to distributions the Property produces, after the fees, taxes and costs the Listing describes, and (b) a pro rata entitlement to the net proceeds if the Property is sold. A Share does not carry a right to occupy, manage or decide on the Property unless the Listing says so. Shares are recorded in the Platform register, which is conclusive evidence of who holds them unless a manifest error is shown.',
  },
  {
    id: 'subject-rent', title: 'Subject and rights', kinds: ['rent'], basis: CONTRACT,
    body: () => 'The Buyer (the tenant) is granted the right to use the Property for the period and on the house rules stated in the Listing, and agrees to pay the amount stated in the Subject. The tenant uses the Property with reasonable care, does not sublet it without written permission, and returns it in the condition in which it was received, fair wear excepted.',
  },
  {
    id: 'subject-hotel', title: 'Subject and rights', kinds: ['hotel'], basis: CONTRACT,
    body: () => 'The Buyer (the guest) is granted the right to occupy the accommodation for the dates in the Subject on the check-in, check-out and house rules stated in the Listing. The right is personal to the guest and the people the Listing allows, and it ends at check-out on the end date.',
  },
  {
    id: 'subject-resale', title: 'Transfer of Shares', kinds: ['resale'], basis: [...ASSETS, ...CONTRACT],
    body: () => 'The Seller transfers the Shares stated in the Subject to the Buyer, who accepts them with the rights the Listing attaches to them. The Seller confirms that it holds those Shares, that they are free of any pledge or claim known to it, and that it has the right to transfer them. The transfer is recorded in the Platform register and takes effect when the payment below is confirmed.',
  },
  {
    id: 'price-pi', title: 'Price and payment', kinds: 'all', basis: [...EC, ...CONSUMER],
    when: (p) => p.rail === 'pi',
    body: (p) => `The Buyer has paid ${money(p)} through the Pi Network payment system (Payment ID: ${p.paymentId}, Transaction: ${p.txid}). The price is the whole price for what the Subject describes; any taxes or charges that the law places on a party are borne by that party. The on-chain Pi Network transaction record is conclusive evidence of the payment.`,
  },
  {
    id: 'price-card', title: 'Price and payment', kinds: 'all', basis: [...EC, ...CONSUMER],
    when: (p) => p.rail === 'card',
    body: (p) => `The Buyer has paid ${money(p)} by card through the Platform's payment provider (Order ID: ${p.orderId ?? p.paymentId}). The price is the whole price for what the Subject describes; any taxes or charges that the law places on a party are borne by that party. The payment provider's record of the order is evidence of the payment.`,
  },
  {
    id: 'resale-settlement', title: 'Fee and settlement', kinds: ['resale'], basis: CONSUMER,
    body: (p) => `The Platform keeps the fee of ${p.resale?.fee ?? 0} ${p.currency} and owes the Seller the remaining ${p.resale?.proceeds ?? 0} ${p.currency}, which the Platform pays out to the Seller. The Platform acts as facilitator of the market and is not a party to the sale of the Shares.`,
  },
  {
    id: 'e-execution', title: 'Electronic execution and evidence', kinds: 'all', basis: [...EC, 'UNCITRAL Model Law on Electronic Transferable Records (2017)'],
    body: () => 'The parties agree to this contract by electronic means, and agree that this contract and its records are not to be denied effect or admissibility only because they are electronic. The Platform signs the SHA-256 fingerprint of this text with its Ed25519 key, and records the fingerprint on a public blockchain where that service is available. The fingerprint contains no personal data. Anchoring proves that this text existed unchanged at that time; it is evidence, not a land or share registry, and a delay in anchoring does not affect this contract.',
  },
  {
    id: 'compliance', title: 'Identity, anti-money-laundering and sanctions', kinds: 'all', basis: AML,
    body: () => 'Each party confirms that its funds come from lawful sources and that it is not subject to sanctions that would prevent this transaction. The Platform may verify identity, ask for documents, delay, refuse or reverse a transaction, and report it where the law requires, and a party who does not cooperate may be refused.',
  },
  {
    id: 'inspection', title: 'Property information', kinds: ['sale', 'invest'], basis: ASSETS,
    when: () => true,
    body: (p) => `Information in the Listing comes from the owner and from the Platform's own checks, and the Platform does not guarantee that it is complete. ${p.hasInspection === false ? '' : 'Where a certified RE Inspect report exists for this Property, its findings and Health Score are incorporated into this contract by reference through the linked certificate hash. '}The Buyer confirms that it has read the Listing before paying.`,
  },
  {
    id: 'cancellation', title: 'Cancellation, withdrawal and refund', kinds: 'all', basis: CONSUMER,
    body: (p) => {
      const kind = p.kind === 'rent' || p.kind === 'hotel'
        ? 'Cancellation by the Buyer follows the cancellation policy stated in the Listing.'
        : p.kind === 'resale'
          ? 'A completed transfer of Shares is final and cannot be withdrawn by either party, except as the law requires.'
          : 'A right to withdraw exists only where the applicable law or the Listing grants one, and a completed delivery of Shares or title cannot be withdrawn after it has been performed.';
      const via = p.rail === 'card' ? 'to the same card through the payment provider' : 'in Pi to the same account';
      return `${kind} If the Platform cannot deliver what was paid for (for example, the dates or Shares were no longer available when the payment arrived), the Buyer is refunded in full ${via}. Rights that the law gives a consumer and that cannot be excluded are not affected by this contract.`;
    },
  },
  {
    id: 'risk', title: 'Risk disclosure', kinds: ['invest', 'resale'], basis: ASSETS,
    body: () => 'Property values and income can fall as well as rise, and the Buyer can lose part or all of the money paid. Shares can be hard to sell: a resale needs a buyer and the Platform does not promise one, a price or a buy-back. Past results do not predict future results. The Platform does not guarantee any return or distribution. The technology the Platform uses, including the Pi Network and other blockchains, can be interrupted or can change, and laws that apply to digital assets can change. Nothing on the Platform is investment, legal or tax advice, and the Buyer confirms that it has the knowledge and capacity to decide on its own, or has taken its own advice.',
  },
  {
    id: 'risk-short', title: 'Risk disclosure', kinds: ['sale', 'rent', 'hotel'], basis: ASSETS,
    body: () => 'The Platform does not guarantee the value, availability or condition of the Property beyond what the Listing states. Nothing on the Platform is investment, legal or tax advice, and the Buyer confirms that it has read the Listing and decided on its own.',
  },
  {
    id: 'distributions', title: 'Distributions and costs', kinds: ['invest'], basis: [...ASSETS, ...SHARIAH],
    body: () => 'If the Property produces income, it is distributed pro rata to the Shares recorded in the register at the date the Platform announces, after the fees, taxes and costs the Listing describes. Timing and amounts are not guaranteed. The Platform may withhold an amount the law requires it to withhold and will say so. A distribution that cannot be paid because the holder cannot be reached is held for the holder until the law or the Listing says otherwise.',
  },
  {
    id: 'transfers', title: 'Transfers and the shares market', kinds: ['invest', 'resale'], basis: [...ASSETS, ...AML],
    body: () => 'Shares may be transferred only through the Platform shares market, on the fee the Platform shows before a sale. A buyer must first pass the Platform checks. The Platform may block or reverse a transfer that would break the law, a sanction, or the terms of the Listing. A transfer does not change the terms of the Property or the rights of other holders.',
  },
  {
    id: 'roles', title: 'Roles, servicing and responsibilities', kinds: 'all', basis: [...ASSETS, ...CONSUMER],
    body: () => 'Unless the Listing says otherwise, the Platform is a technology facilitator and signer of record. It is not a bank and does not give advice. Management, maintenance and day-to-day service of the Property are the responsibility of the owner or the manager named in the Listing. If that party does not meet an obligation, the Platform will take reasonable steps to ask it to put the matter right and will tell the Buyer what happened, and the Buyer keeps the remedies the law gives it against the party responsible.',
  },
  {
    id: 'shariah', title: "Shari'ah status", kinds: ['sale', 'invest', 'rent', 'hotel', 'resale'], basis: SHARIAH,
    when: (p) => p.shariah === true,
    body: () => "The Listing states that this offering is intended to follow Shari'ah-aligned principles. The parties acknowledge that this contract does not state that a Shari'ah supervisory board has certified the offering, unless the Listing names the board and the certificate. The Buyer is encouraged to take its own Shari'ah advice. This clause does not change any other term of this contract.",
  },
  {
    id: 'data', title: 'Personal data', kinds: 'all', basis: DATA,
    body: () => 'The Platform is the controller of the personal data used for this contract. It uses it to perform the contract, to verify identity and meet legal duties, and to keep the records the law requires, and it keeps it only as long as those purposes or the law need. The text of this contract and its public verification page show only the limited, masked details the Platform chooses to show, and the blockchain record holds only a fingerprint. A person can ask the Platform, through the contact channel published on the Platform, to see, correct or erase their data, and the Platform will answer within the time the law sets, subject to the records it must keep. Data may be handled by service providers in other countries under safeguards that protect it.',
  },
  {
    id: 'liability', title: 'Limits of liability', kinds: 'all', basis: [...CONTRACT, ...CONSUMER],
    body: () => 'To the extent the law allows, the Platform is not liable for indirect or consequential loss, or for loss from events it does not control. Nothing in this contract limits liability for fraud, for death or personal injury caused by negligence, or for anything that the law does not allow to be limited.',
  },
  {
    id: 'force-majeure', title: 'Events beyond control', kinds: 'all', basis: CONTRACT,
    body: () => 'A party is not in breach for a delay or failure caused by an event beyond its reasonable control, including outages of payment providers, networks or blockchains, and it will tell the other party and resume as soon as it can. This does not excuse a duty to pay money already due or to refund under this contract.',
  },
  {
    id: 'disputes', title: 'Disputes', kinds: 'all', basis: [...CONTRACT, ...CONSUMER],
    body: () => 'A party with a complaint raises it with the Platform support channel first, and the parties try in good faith to settle it within 30 days. If it is not settled, it is decided by the competent courts of the jurisdiction whose law governs this contract, or by arbitration if the parties agree to that in writing. Nothing in this clause takes away a consumer\'s right to bring a claim in the forum the law gives it, or to use any complaint or dispute service that the law provides.',
  },
  {
    id: 'law', title: 'Governing law', kinds: 'all', basis: CONTRACT,
    body: (p) => `This contract is governed by ${p.governingLaw}, and the mandatory rules of the place where a consumer lives continue to protect that consumer.${p.extraClause ? ` Additional terms. ${p.extraClause}` : ''}`,
  },
  {
    id: 'pilot', title: 'Pilot phase', kinds: 'all', basis: [],
    body: (p) => p.kind === 'resale'
      ? 'This contract is issued during a technical pilot phase. It records an in-platform transfer of Shares and is not yet a legally binding conveyance until reviewed and confirmed compliant with applicable law.'
      : 'This contract is issued during a technical pilot phase and does not yet constitute a legally binding conveyance until reviewed and confirmed compliant with applicable law.',
  },
  {
    id: 'general', title: 'General', kinds: 'all', basis: CONTRACT,
    body: () => 'This contract, with the Listing, is the whole agreement on its subject. If a term is unenforceable, the rest stays in force. A failure to enforce a right is not a waiver of it. A party may not assign its rights except that Shares may be transferred through the shares market. Notices go through the Platform. The English text is the signed original and prevails over any translation, which is given for convenience only. The terms on payment, refund, data, disputes and governing law continue after the contract is performed.',
  },
];

export const FRAMEWORK_BASIS = Array.from(new Set(CLAUSES.flatMap((c) => c.basis))).sort();

export function clausesFor(p: FrameworkParams): Clause[] {
  return CLAUSES.filter((c) => (c.kinds === 'all' || c.kinds.includes(p.kind)) && (c.when ? c.when(p) : true));
}

/** The numbered TERMS text for one deal. */
export function frameworkTerms(p: FrameworkParams): string {
  const list = clausesFor(p);
  const body = list.map((c, i) => `${i + 1}. ${c.title}. ${c.body(p)}`).join('\n');
  return `${FRAMEWORK_MARKER}${FRAMEWORK_VERSION} (${p.kind})\n${body}`;
}

export const isFrameworkText = (text: string | undefined | null): boolean => !!text && text.includes(`\n${FRAMEWORK_MARKER}`);

/** Instant roll back: set CONTRACT_FRAMEWORK=legacy in Vercel and redeploy; new contracts use the original six clauses again. */
export const frameworkEnabled = (): boolean => (process.env.CONTRACT_FRAMEWORK ?? '').toLowerCase() !== 'legacy';

type ContractArgs = Parameters<typeof generateContractText>[0];
type ResaleArgs = Parameters<typeof generateResaleContractText>[0];

/** What kind of deal an ordinary contract is, from the same inputs the original generator gets. */
export function frameworkKindOf(c: Pick<ContractArgs, 'type' | 'booking' | 'shares'>): FrameworkKind {
  if (c.type === 'rent') return 'rent';
  if (c.shares || c.type === 'invest' || c.type === 'tokenized') return 'invest';
  if (c.booking) return 'hotel';
  return 'sale';
}

const headOf = (text: string): string => {
  const i = text.indexOf('\nTERMS\n');
  return i === -1 ? text : text.slice(0, i);
};

/** The contract text a buyer signs: the original header and parties, then the framework TERMS (or the original text when switched to legacy). */
export function buildContractText(c: ContractArgs, opts: { shariah?: boolean; hasInspection?: boolean } = {}): string {
  const legacy = generateContractText(c);
  if (!frameworkEnabled()) return legacy;
  const p: FrameworkParams = {
    kind: frameworkKindOf(c), rail: c.card ? 'card' : 'pi',
    governingLaw: c.legal?.governingLaw ?? 'the laws of the United Arab Emirates', extraClause: c.legal?.extraClause,
    shariah: opts.shariah, hasInspection: opts.hasInspection,
    currency: c.currency, amount: c.amount, paymentId: c.paymentId, txid: c.txid, orderId: c.card?.orderId,
  };
  return `${headOf(legacy)}\nTERMS\n${frameworkTerms(p)}`;
}

export function buildResaleContractText(c: ResaleArgs, opts: { shariah?: boolean } = {}): string {
  const legacy = generateResaleContractText(c);
  if (!frameworkEnabled()) return legacy;
  const p: FrameworkParams = {
    kind: 'resale', rail: 'pi',
    governingLaw: c.legal?.governingLaw ?? 'the laws of the United Arab Emirates', extraClause: c.legal?.extraClause,
    shariah: opts.shariah,
    currency: c.currency, amount: c.amount, paymentId: c.paymentId, txid: c.txid,
    resale: { fee: c.fee, proceeds: c.proceeds },
  };
  return `${headOf(legacy)}\nTERMS\n${frameworkTerms(p)}`;
}
