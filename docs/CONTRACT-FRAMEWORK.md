# RE Global Contract Framework (v1.0)

Written for the lawyer who reviews the contracts, and for whoever operates the platform.
This is a drafting framework, not legal advice. Nothing here has been reviewed by counsel yet, and no clause claims compliance with any law.

## What it is

One library of clauses (`lib/contract-framework.ts`) and one template per kind of deal:

| Kind | Used for |
|---|---|
| `sale` | Buying a property |
| `invest` | Buying Shares of a property (fractional) |
| `rent` | Renting for a period |
| `hotel` | A hotel stay |
| `resale` | Selling Shares to another user through the shares market |

Card and Pi payments use the same template; only the payment and refund wording differs.
Each contract states `Framework: RE Global Contract Framework v1.0 (<kind>)` at the start of its TERMS.

## What did not change

- The header, the parties and the subject lines are produced by the original generators, byte for byte, so the verify page and every parser keep working.
- Contracts already signed are untouched: their stored text, hash, signature and blockchain record stay as they are. Only new contracts use the framework.
- The pilot-phase clause stays in every contract. It says the contract is not a binding conveyance until counsel confirms it. Remove it only when counsel says so, by editing the `pilot` clause and raising the version.
- The country profile (governing law, status line, extra clause from the admin panel) still drives the governing-law clause.

## Clauses and the references they were written against

The references are where counsel should look first. They are not claims of compliance.

| Clause | Kinds | References |
|---|---|---|
| Definitions and interpretation | all | UNIDROIT Principles 2016 |
| Subject and rights (per kind) | per kind | UNIDROIT Principles; IOSCO and MiCA disclosure principles (Shares) |
| Price and payment (Pi or card) | all | UNCITRAL e-commerce and e-signature models; eIDAS; ESIGN/UETA; EU Consumer Rights Directive; UN Consumer Guidelines; OECD e-commerce recommendation |
| Fee and settlement | resale | Consumer protection references above |
| Electronic execution and evidence | all | UNCITRAL Model Laws (1996, 2001, MLETR 2017); eIDAS; ESIGN/UETA |
| Identity, anti-money-laundering and sanctions | all | FATF Recommendations 10 and 15; UN and OFAC sanctions programmes |
| Property information | sale, invest | IOSCO, MiCA disclosure principles |
| Cancellation, withdrawal and refund | all | EU Consumer Rights Directive; UN and OECD consumer guidance |
| Risk disclosure | all (long form for invest, resale) | IOSCO; MiCA |
| Distributions and costs | invest | IOSCO, MiCA; AAOIFI Standards 9, 12, 17 |
| Transfers and the shares market | invest, resale | IOSCO, MiCA; FATF |
| Roles, servicing and responsibilities | all | IOSCO, MiCA; consumer references |
| Shari'ah status | only if the listing says so | AAOIFI Standards 9, 12, 17 |
| Personal data | all | GDPR arts 5, 6, 13, 15 to 17; Egypt PDPL No. 151 of 2020 |
| Limits of liability, Events beyond control, Disputes, Governing law, General | all | UNIDROIT; consumer references |

## Where the clauses answer the questions investors ask

- What the holder owns: `Subject and rights attached to Shares`.
- How returns arrive: `Distributions and costs`.
- How a Share moves: `Transfers and the shares market`, `Transfer of Shares`.
- Who is responsible, and what happens when an obligation is not met: `Roles, servicing and responsibilities`.
- What can go wrong: `Risk disclosure`.

## Decisions for counsel

1. Does the platform's role ("technology facilitator and signer of record") match its real legal position in each country?
2. The `Subject and rights attached to Shares` clause describes pro rata entitlements. It must match the real legal structure that holds each Property (who holds title, whether a company or trust is used).
3. Withdrawal and refund periods for consumers per country. The clause defers to the Listing and to mandatory law.
4. Dispute forum: courts of the governing-law jurisdiction by default. Arbitration (for example under UNCITRAL Rules) can be added per country through the profile's extra clause.
5. Arabic and other translations of the clauses. The signed original is English; the translated view shows the English text with a note. Real legal translations should come from counsel.
6. Shari'ah: the clause only says that no certification is stated unless the Listing names a board and certificate. A property is flagged by a boolean `shariah: true` on its record. There is no admin field for it yet, so today it is set directly in the database. A Shari'ah supervisory board must review before any offering is described as compliant. The installment markup ("extra percent") in partner projects needs its own review under that.
7. Data retention periods that the Personal data clause refers to.

## Rolling back

Set `CONTRACT_FRAMEWORK=legacy` in Vercel and redeploy: new contracts use the original six clauses again. Contracts already created with the framework stay valid and keep their text.

## Changing a clause

1. Edit the clause in `lib/contract-framework.ts`.
2. Raise `FRAMEWORK_VERSION` (a changed text is a new version).
3. Run the tests: `tests/contract-framework.test.ts` checks numbering, that no clause claims returns or compliance, that each kind keeps its protections, and that the header is unchanged.
