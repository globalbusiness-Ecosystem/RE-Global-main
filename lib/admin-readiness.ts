import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { getPiUsdRate } from '@/lib/pricing';
import { isUsdPegged } from '@/lib/payment-rules';
import { shareMismatches } from '@/lib/share-rules';
import { isStrongPin } from '@/lib/pin-strength';
import { countIncomplete } from '@/lib/listing-quality';
import { emailConfigured } from '@/lib/send-email';
import { ensureProviders } from '@/lib/card-pay/registry';
import { ensureKycProviders } from '@/lib/kyc-provider/registry';
import { activeKycProvider } from '@/lib/kyc-provider/provider';
import { buildReadiness, readinessSummary, type ReadinessInput } from '@/lib/launch-readiness';

const has = (k: string) => !!process.env[k];
const count = async (q: FirebaseFirestore.Query) => (await q.count().get()).data().count;

// Reads flags and counts only: no value of any secret leaves this function.
export async function gatherReadiness() {
  const db = adminDb;
  const [props, rate, rb, rh, rt, confirmed, kycDocs] = await Promise.all([
    db.collection('properties').select('currency', 'title', 'sharesSold', 'hidden', 'image', 'images', 'price', 'lat', 'lng').get(),
    getPiUsdRate().catch(() => null),
    count(db.collection('bookings').where('status', '==', 'review')),
    count(db.collection('share_holdings').where('status', '==', 'review')),
    count(db.collection('share_transfers').where('status', '==', 'review')),
    db.collection('share_holdings').where('status', '==', 'confirmed').select('propertyId', 'shares', 'status').get(),
    db.collection('kyc').where('status', '==', 'pending').select('submittedAt').limit(500).get().catch(() => ({ docs: [] as FirebaseFirestore.QueryDocumentSnapshot[] })),
  ]);
  ensureProviders();
  ensureKycProviders();
  const oldest = kycDocs.docs.map((d) => d.data().submittedAt?.toMillis?.() as number | undefined).filter((n): n is number => typeof n === 'number').sort((a, b) => a - b)[0];
  const sandboxOn = (process.env.CARD_SANDBOX_SECRET ?? '').length >= 16;
  const input: ReadinessInput = {
    env: {
      PI_API_KEY: has('PI_API_KEY'), PI_ISSUER_SECRET_KEY: has('PI_ISSUER_SECRET_KEY'), PI_ISSUER_PUBLIC_KEY: has('PI_ISSUER_PUBLIC_KEY'),
      ADMIN_SESSION_SECRET: has('ADMIN_SESSION_SECRET'), ADMIN_TOTP_SECRET: has('ADMIN_TOTP_SECRET'),
      ADMIN_PIN_STRONG: has('ADMIN_PIN') && isStrongPin(process.env.ADMIN_PIN), ADMIN_ALERT_EMAIL: has('ADMIN_ALERT_EMAIL'), CRON_SECRET: has('CRON_SECRET'),
      EMAIL_CONFIGURED: emailConfigured(),
      FIREBASE_WEB_CONFIG: ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID'].every((k) => has(`NEXT_PUBLIC_FIREBASE_${k}`)),
      CUSTOM_DOMAIN: has('NEXT_PUBLIC_BASE_URL'),
    },
    cardSandboxOn: sandboxOn,
    // Only the test provider exists today; a real company counts once its adapter is registered (and it is not the sandbox).
    realCardProvider: false,
    kycByCompany: activeKycProvider() !== null,
    visibleProperties: props.docs.filter((d) => d.data().hidden !== true).length,
    incompleteListings: countIncomplete(props.docs.map((d) => d.data())),
    usdProperties: props.docs.filter((d) => isUsdPegged(d.data().currency)).length,
    piRateSet: rate !== null,
    reviewCases: rb + rh + rt,
    shareMismatches: shareMismatches(
      props.docs.map((d) => ({ id: d.id, title: String(d.data().title ?? d.id).slice(0, 40), sharesSold: Number(d.data().sharesSold) || 0 })),
      confirmed.docs.map((d) => ({ propertyId: String(d.data().propertyId ?? ''), shares: Number(d.data().shares) || 0, status: d.data().status })),
    ).length,
    kycPending: kycDocs.docs.length,
    kycOldestHours: oldest ? Math.max(0, (Date.now() - oldest) / 3_600_000) : 0,
  };
  const checks = buildReadiness(input);
  return { checks, summary: readinessSummary(checks) };
}
