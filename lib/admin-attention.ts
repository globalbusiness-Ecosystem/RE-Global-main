import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { getPiUsdRate } from '@/lib/pricing';
import { isUsdPegged } from '@/lib/payment-rules';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';
import { shareMismatches } from '@/lib/share-rules';
import { isStrongPin } from '@/lib/pin-strength';
import { countIncomplete } from '@/lib/listing-quality';

const has = (k: string) => !!process.env[k];
const count = async (q: FirebaseFirestore.Query) => (await q.count().get()).data().count;

// Reads the few numbers the admin dashboard needs. Only flags and counts leave this function, never values of secrets.
export async function gatherAttention() {
  const db = adminDb;
  const [props, rate, payouts, rb, rh, rt, confirmed] = await Promise.all([
    db.collection('properties').select('currency', 'title', 'sharesSold', 'hidden', 'image', 'images', 'price', 'lat', 'lng').get(),
    getPiUsdRate().catch(() => null),
    db.collection('payouts').where('status', '==', 'pending').limit(500).get(),
    count(db.collection('bookings').where('status', '==', 'review')),
    count(db.collection('share_holdings').where('status', '==', 'review')),
    count(db.collection('share_transfers').where('status', '==', 'review')),
    db.collection('share_holdings').where('status', '==', 'confirmed').select('propertyId', 'shares', 'status').get(),
  ]);
  const cardOrders = await db.collection('card_orders').where('status', '==', 'paid').limit(200).get().catch(() => ({ docs: [] as FirebaseFirestore.QueryDocumentSnapshot[] }));
  const kycDocs = await db.collection('kyc').where('status', '==', 'pending').select('submittedAt').limit(500).get().catch(() => ({ docs: [] as FirebaseFirestore.QueryDocumentSnapshot[] }));
  const kycPending = kycDocs.docs.length;
  const oldest = kycDocs.docs.map((d) => d.data().submittedAt?.toMillis?.() as number | undefined).filter((n): n is number => typeof n === 'number').sort((a, b) => a - b)[0];
  const kycOldestHours = oldest ? Math.max(0, (Date.now() - oldest) / 3_600_000) : 0;
  const cardContractsUnanchored = (await Promise.all([
    count(db.collection('signed_contracts').where('paymentMethod', '==', 'card').where('txid', '==', '')).catch(() => 0),
    count(db.collection('signed_contracts').where('paymentMethod', '==', 'card').where('registryPending', '==', true)).catch(() => 0),
  ])).reduce((x, y) => Math.max(x, y), 0);
  const openReports = await count(db.collection('listing_reports').where('status', '==', 'open')).catch(() => 0);
  const input: AttentionInput = {
    env: { PI_API_KEY: has('PI_API_KEY'), PI_ISSUER_SECRET_KEY: has('PI_ISSUER_SECRET_KEY'), PI_ISSUER_PUBLIC_KEY: has('PI_ISSUER_PUBLIC_KEY'), ADMIN_SESSION_SECRET: has('ADMIN_SESSION_SECRET'), ADMIN_TOTP_SECRET: has('ADMIN_TOTP_SECRET'), ADMIN_PIN_STRONG: has('ADMIN_PIN') ? isStrongPin(process.env.ADMIN_PIN) : undefined, ADMIN_ALERT_EMAIL: (has('GMAIL_USER') && has('GMAIL_APP_PASSWORD')) || has('RESEND_API_KEY') ? has('ADMIN_ALERT_EMAIL') : undefined, CRON_SECRET: has('ADMIN_ALERT_EMAIL') ? has('CRON_SECRET') : undefined },
    usdProperties: props.docs.filter((d) => isUsdPegged(d.data().currency)).length,
    piRateSet: rate !== null,
    openReports,
    incompleteListings: countIncomplete(props.docs.map((d) => d.data())),
    // Pi payouts only: a refund owed in a card currency is a different thing (the admin returns it from the payment company's dashboard).
    pendingPayouts: { count: payouts.docs.filter((d) => !d.data().currency).length, amount: payouts.docs.filter((d) => !d.data().currency).reduce((n, d) => n + (Number(d.data().amount) || 0), 0) },
    cardRefunds: payouts.docs.filter((d) => !!d.data().currency).length,
    cardOrdersToHandOver: cardOrders.docs.filter((d) => !d.data().handedOverAt && !d.data().booking).length,
    kycPending,
    cardContractsUnanchored,
    kycOldestHours,
    cardSandboxOn: (process.env.CARD_SANDBOX_SECRET ?? '').length >= 16,
    review: { bookings: rb, holdings: rh, transfers: rt },
    shareMismatches: shareMismatches(
      props.docs.map((d) => ({ id: d.id, title: String(d.data().title ?? d.id).slice(0, 40), sharesSold: Number(d.data().sharesSold) || 0 })),
      confirmed.docs.map((d) => ({ propertyId: String(d.data().propertyId ?? ''), shares: Number(d.data().shares) || 0, status: d.data().status })),
    ).map((p) => p.title),
  };
  return buildAttention(input);
}
