# Distribution of income to Share holders (Phases 289 and 290)

Phase 289 calculates and saves drafts. Phase 290 adds the approval that creates the payouts. Neither moves money by itself: a payout is a record the admin pays by hand, like refunds and resale proceeds. Neither touches a balance or a Share count.

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

## Approval (Phase 290)

- Locked by default. It works only when `PLATFORM_MODE` is `SOFT_LAUNCH` or `LIVE` (see docs/PLATFORM-MODE.md) and `DISTRIBUTIONS_ENABLED=1` is set in Vercel and the app is redeployed. Do not set either before counsel has answered the questions below.
- Only a draft can be approved. The admin must type the net amount of the run.
- Approval creates one pending payout (kind `distribution`, id `dist-<run>-<uid>`) for each holder whose identity check (KYC) is approved. Holders without an approved KYC are listed on the run as held, with their amount, and no payout is created for them.
- It is safe to repeat: a payout that already exists is never touched, and a run left half done ("approving") is finished by approving it again.
- The holder sees it under "Owed to me" as "Property income" in the market page and as an alert in 7 languages. The admin sees it in Payments, "Transfers and refunds", and marks it paid after sending the Pi, as for the other payouts.
- An approved run cannot be cancelled. A wrong payout is handled by hand.

## For counsel before real money is used

1. Who receives income when Shares are unsold (the owner, the platform, or it is reinvested).
2. Withholding or tax on distributions per country, and who files it.
3. Whether the platform may take the fee before distributing, and how the Listing must describe it.
4. Whether distributions are owed even when the holder has not passed KYC (this phase does not check KYC; the paying step must).
5. Shari'ah review of how income and costs are shared, if a Property is offered as Shari'ah-aligned.
6. Rounding policy for the unallocated dust.
