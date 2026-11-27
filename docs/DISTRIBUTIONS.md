# Distribution of income to Share holders (Phase 289)

This phase only calculates and saves drafts. It does not move money, create a payout, or touch a balance or a Share count. Paying a run is a later, separate step.

Admin, Payments, tab "Distributions". Owner account only.

## The rules (fixed in `lib/distribution.ts`)

- A period is whole calendar days (UTC), both ends included, at most 400 days.
- A Share counts for a day if the holder held it at the end of that day. When Shares change hands inside the period, the seller earns up to the day before the sale and the buyer from the day of the sale, so every Share earns every day exactly once.
- A holder's weight is their share-days. The denominator is all the Shares of the Property times the days. The part that belongs to Shares nobody holds is never paid out; it is shown as "unallocated".
- The platform fee (0 to 50 percent) is taken first, in basis points, cut down.
- Each holder's amount is cut down to 4 decimals, never rounded up, so the total allocated can never exceed the net amount. The cut-off dust is unallocated too.
- A ledger that holds more Shares than the Property has is refused.
- Two runs for the same Property cannot cover the same day (a cancelled run does not count).

## Where the numbers come from

Confirmed purchases from the platform (`share_holdings`) and confirmed transfers between users (`share_transfers`). Cancelled purchases and ones held for review never count.

## What is saved

`distributions/{id}`: property, period, gross, fee, net, allocated, unallocated, one row per holder, status `draft` or `cancelled`. A draft can be exported as CSV or cancelled.

## For counsel before real money is used

1. Who receives income when Shares are unsold (the owner, the platform, or it is reinvested).
2. Withholding or tax on distributions per country, and who files it.
3. Whether the platform may take the fee before distributing, and how the Listing must describe it.
4. Whether distributions are owed even when the holder has not passed KYC (this phase does not check KYC; the paying step must).
5. Shari'ah review of how income and costs are shared, if a Property is offered as Shari'ah-aligned.
6. Rounding policy for the unallocated dust.
