# Security policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue.
The contact address is published at `/.well-known/security.txt` on the live site (RFC 9116).
Include what you found, the steps to reproduce it, and the impact you expect. Do not include real users' personal data.

We aim to acknowledge a report within 3 working days. We ask for a reasonable time to fix a problem before it is made public.

## Scope

The RE-Global web application, its API routes and the admin panel.
Out of scope: denial-of-service tests, social engineering of staff, and third-party services (Pi Network, Firebase, Vercel).

## What protects the project

- Dependencies are audited on every push and every week (`.github/workflows/security.yml`), and updated by Dependabot.
- Static analysis runs with CodeQL (`.github/workflows/codeql.yml`).
- A test fails the build when a key, token or private key is committed (`tests/no-secrets.test.ts`).
- Admin access is role-based, every change is logged by name, and any admin account can be suspended instantly.
