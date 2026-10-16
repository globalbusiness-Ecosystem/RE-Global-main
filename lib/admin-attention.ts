import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { getPiUsdRate } from '@/lib/pricing';
import { isUsdPegged } from '@/lib/payment-rules';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';
import { shareMismatches } from '@/lib/share-rules';

const has = (k: string) => !!process.env[k];
const count = async (q: FirebaseFirestore.Query) => (await q.count().get()).data().count;

// Reads the few numbers the admin dashboard needs. Only flags and counts leave this function, never values of secrets.
export async function gatherAttention() {
  const db = adminDb;
  const [props, rate, payouts, rb, rh, rt, confirmed] = await Promise.all([
    db.collection('properties').select('currency', 'title', 'sharesSold').get(),
    getPiUsdRate().catch(() => null),
    db.collection('payouts').where('status', '==', 'pending').limit(500).get(),
    count(db.collection('bookings').where('status', '==', 'review')),
    count(db.collection('share_holdings').where('status', '==', 'review')),
    count(db.collection('share_transfers').where('status', '==', 'review')),
    db.collection('share_holdings').where('status', '==', 'confirmed').select('propertyId', 'shares', 'status').get(),
  ]);
  const input: AttentionInput = {
    env: { PI_API_KEY: has('PI_API_KEY'), PI_ISSUER_SECRET_KEY: has('PI_ISSUER_SECRET_KEY'), PI_ISSUER_PUBLIC_KEY: has('PI_ISSUER_PUBLIC_KEY'), ADMIN_SESSION_SECRET: has('ADMIN_SESSION_SECRET') },
    usdProperties: props.docs.filter((d) => isUsdPegged(d.data().currency)).length,
    piRateSet: rate !== null,
    pendingPayouts: { count: payouts.size, amount: payouts.docs.reduce((n, d) => n + (Number(d.data().amount) || 0), 0) },
    review: { bookings: rb, holdings: rh, transfers: rt },
    shareMismatches: shareMismatches(
      props.docs.map((d) => ({ id: d.id, title: String(d.data().title ?? d.id).slice(0, 40), sharesSold: Number(d.data().sharesSold) || 0 })),
      confirmed.docs.map((d) => ({ propertyId: String(d.data().propertyId ?? ''), shares: Number(d.data().shares) || 0, status: d.data().status })),
    ).map((p) => p.title),
  };
  return buildAttention(input);
}
