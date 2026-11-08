import 'server-only';

// Connects the identity-check companies whose secrets are set in the environment. A real company is added here
// (one adapter file, then registerKycProvider(...)) once an account exists. Until then this stays empty and the
// team reviews every request by hand.
export function ensureKycProviders(): void {
  // Example once an adapter exists:
  // if (process.env.SUMSUB_SECRET && !getKycProvider('sumsub')) registerKycProvider(sumsubProvider(process.env.SUMSUB_SECRET));
}
