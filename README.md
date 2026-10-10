# RE Platform (RE-Global)

Global real-estate marketplace on Pi Network: buy, rent, invest, tokenized properties, 360° tours, smart contracts, RE Token, and the "Aladdin" AI advisor.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Firebase (Firestore, Auth, Storage) · Pi SDK · Stellar SDK · Tailwind 4.

## Getting started

~~~bash
pnpm install           # pnpm is required (the lockfile is pnpm-lock.yaml)
cp .env.example .env.local   # then fill in the values
pnpm dev
~~~

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build (needs no secrets) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (currently warnings only — see `eslint.config.mjs`) |
| `pnpm test` | Unit tests (Vitest) |

CI (`.github/workflows/ci.yml`) runs typecheck, lint, tests and build on every push to `main` and every pull request.

## Architecture notes

- **Identity:** the client signs in with Pi; API routes verify the Pi access token against `api.minepi.com/v2/me` (`lib/pi-auth.ts`, `lib/api-guard.ts`). The Pi username is mapped into a Firebase custom token so `firestore.rules` can enforce per-user access.
- **Payments:** approve/complete/cancel go through `lib/pi-payment-guard.ts`, which checks the payment really belongs to the caller. Contracts are signed server-side only after a completed payment (`app/api/contracts/sign`).
- **Admin:** `/admin` is protected by a PIN that is verified on the server, which then issues a signed, HTTP-only session cookie (`lib/admin-session.ts`, `middleware.ts`).
- **Rate limiting:** shared counter in Firestore (`lib/rate-limit.ts`, collection `rate_limits`; add a TTL policy on `expireAt`).
- **AI routes:** bodies and chat histories are size-limited (`lib/ai-input.ts`).
- **Firestore:** rules live in `firestore.rules` (deploy them with the Firebase CLI). Server-only collections are denied to clients.

## Security

Never commit secrets. Rotate any key that has been pasted in a screenshot, chat or issue. Report vulnerabilities privately to the maintainer rather than in a public issue.

## Docs

Older generated implementation notes were moved to `docs/archive/` and may be outdated.
