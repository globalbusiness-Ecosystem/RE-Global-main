import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { getPiUsdRate } from '@/lib/pricing';
import { isUsdPegged } from '@/lib/payment-rules';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';

const has = (k: string) => !!process.env[k];
const count = async (q: FirebaseFirestore.Query) => (await q.count().get()).data().count;

// Reads the few numbers the admin dashboard needs. Only flags and counts leave this function, never values of secrets.
export async function gatherAttention() {
  const db = adminDb;
  const [props, rate, payouts, rb, rh, rt] = await Promise.all([
    db.collection('properties').select('currency').get(),
    getPiUsdRate().catch(() => null),
    db.collection('payouts').where('status', '==', 'pending').limit(500).get(),
    count(db.collection('bookings').where('status', '==', 'review')),
    count(db.collection('share_holdings').where('status', '==', 'review')),
    count(db.collection('share_transfers').where('status', '==', 'review')),
  ]);
  const input: AttentionInput = {
    env: { PI_API_KEY: has('PI_API_KEY'), PI_ISSUER_SECRET_KEY: has('PI_ISSUER_SECRET_KEY'), PI_ISSUER_PUBLIC_KEY: has('PI_ISSUER_PUBLIC_KEY'), ADMIN_SESSION_SECRET: has('ADMIN_SESSION_SECRET') },
    usdProperties: props.docs.filter((d) => isUsdPegged(d.data().currency)).length,
    piRateSet: rate !== null,
    pendingPayouts: { count: payouts.size, amount: payouts.docs.reduce((n, d) => n + (Number(d.data().amount) || 0), 0) },
    review: { bookings: rb, holdings: rh, transfers: rt },
  };
  return buildAttention(input);
}
