export interface LegalClause {
  id: string;
  lawRef: string;
  text: (propertyTitle: string) => string;
}

const clauseLibrary: Record<string, Record<string, LegalClause[]>> = {
  AE: {
    buy: [
      {
        id: 'ownership_transfer',
        lawRef: 'UAE Federal Law No. 7 of 2006, Art. 3',
        text: (p) => `Transfer of ownership for ${p} shall only be effective upon registration with the competent Land Department, in accordance with Federal Law No. 7 of 2006.`
      },
      {
        id: 'escrow_requirement',
        lawRef: 'UAE Law No. 8 of 2007 (Escrow Accounts)',
        text: () => `All payments under this contract shall be held in a licensed escrow account until registration is confirmed, pursuant to Law No. 8 of 2007.`
      }
    ],
    rent: [
      {
        id: 'rental_increase_cap',
        lawRef: 'RERA Decree No. 43 of 2013',
        text: () => `Any rent increase shall not exceed the limits set by the applicable Rental Increase Index in effect at the time of renewal.`
      },
      {
        id: 'eviction_notice',
        lawRef: 'UAE Law No. 26 of 2007, Art. 25',
        text: () => `Eviction prior to contract expiry is only permissible under the grounds enumerated in Article 25 of Law No. 26 of 2007, with 12 months prior notice.`
      }
    ],
    tokenize: [
      {
        id: 'token_classification',
        lawRef: 'VARA Virtual Assets Regulation 2023',
        text: () => `This token represents a fractional economic interest and does not constitute direct legal title until such title is recognized by applicable real estate registration law.`
      }
    ]
  },
  GENERIC: {
    buy: [
      {
        id: 'ownership_transfer_generic',
        lawRef: 'Local property registration law (jurisdiction not yet mapped)',
        text: (p) => `Transfer of ownership for ${p} is subject to registration with the competent local land or property registry, as required by the applicable jurisdiction's law.`
      }
    ],
    rent: [
      {
        id: 'rental_terms_generic',
        lawRef: 'Local tenancy law (jurisdiction not yet mapped)',
        text: () => `Rent increases and eviction terms are governed by the tenancy law of the property's jurisdiction, which has not yet been mapped in this system.`
      }
    ],
    tokenize: [
      {
        id: 'token_classification_generic',
        lawRef: 'Local virtual/digital asset regulation (jurisdiction not yet mapped)',
        text: () => `This token represents a fractional economic interest only. It does not constitute legal title unless recognized under the applicable jurisdiction's asset and property law.`
      }
    ]
  }
};

export function buildLegalClauseText(countryCode: string | undefined, type: string, propertyTitle: string): string {
  const country = (countryCode || 'GENERIC').toUpperCase();
  const jurisdiction = clauseLibrary[country] || clauseLibrary.GENERIC;
  const clauses = jurisdiction[type] || [];
  if (clauses.length === 0) return '';

  const lines = clauses.map((clause, i) =>
    `${i + 1}. [${clause.lawRef}] ${clause.text(propertyTitle)}`
  );

  return `\n\nLEGAL COMPLIANCE (${country})\n${lines.join('\n')}`;
}
