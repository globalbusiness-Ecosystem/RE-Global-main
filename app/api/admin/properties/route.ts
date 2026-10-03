import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const TYPES = ['buy', 'rent', 'hotel', 'tokenized', 'abroad', 'offplan', 'invest'];
const PROPERTY_TYPES = ['apartment', 'villa', 'penthouse', 'commercial'];
const STATUSES = ['available', 'sold', 'under_construction'];
const CURRENCIES = ['Pi', 'USD', 'EGP'];
const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

function str(v: unknown, max: number, multiline = false): string {
  if (typeof v !== 'string') return '';
  const cleaned = multiline
    ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    : v.replace(/[\u0000-\u001f\u007f]+/g, ' ');
  return cleaned.trim().slice(0, max);
}

// '' is allowed (field left empty); null means "present but not a safe URL".
function url(v: unknown): string | null {
  const s = str(v, 2000);
  if (!s) return '';
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? s : null;
  } catch {
    return null;
  }
}

function num(v: unknown, min: number, max: number): number | null {
  if (v === '' || v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  let b: any;
  try {
    b = await req.json();
  } catch {
    return bad('Invalid request');
  }
  if (!b || typeof b !== 'object') return bad('Invalid request');

  const title = str(b.title, 200);
  if (!title) return bad('Title is required');
  const price = num(b.price, 0, 1e12);
  const bedrooms = num(b.bedrooms, 0, 1000);
  const bathrooms = num(b.bathrooms, 0, 1000);
  const area = num(b.area, 0, 1e7);
  if (price === null || bedrooms === null || bathrooms === null || area === null) return bad('Invalid number');
  if (!CURRENCIES.includes(b.currency)) return bad('Invalid currency');
  if (!TYPES.includes(b.type)) return bad('Invalid listing type');
  if (!PROPERTY_TYPES.includes(b.propertyType)) return bad('Invalid property type');
  if (!STATUSES.includes(b.status)) return bad('Invalid status');

  const image = url(b.image);
  const vrUrl = url(b.vrUrl);
  if (image === null || vrUrl === null) return bad('Invalid URL');
  const imagesIn: unknown[] = Array.isArray(b.images) ? b.images : [];
  if (imagesIn.length > 30) return bad('Too many images');
  const images: string[] = [];
  for (const raw of imagesIn) {
    const u = url(raw);
    if (u === null) return bad('Invalid image URL');
    if (u) images.push(u);
  }

  const amenitiesIn = b.amenities && typeof b.amenities === 'object' ? b.amenities : {};
  const amenities = {
    pool: amenitiesIn.pool === true,
    gym: amenitiesIn.gym === true,
    parking: amenitiesIn.parking === true,
    security: amenitiesIn.security === true,
  };

  const doc: Record<string, unknown> = {
    title,
    location: str(b.location, 200),
    price,
    currency: b.currency,
    type: b.type,
    propertyType: b.propertyType,
    status: b.status,
    bedrooms,
    bathrooms,
    area,
    description: str(b.description, 5000, true),
    image,
    images,
    vrUrl,
    tokenized: b.tokenized === true,
    amenities,
    // useProperties() orders by createdAt, so a listing without it never shows up.
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Optional fields used by the app when present.
  for (const k of ['titleAr', 'locationAr'] as const) {
    const s = str(b[k], 200);
    if (s) doc[k] = s;
  }
  const descAr = str(b.descriptionAr, 5000, true);
  if (descAr) doc.descriptionAr = descAr;
  if (b.featured === true) doc.featured = true;
  const lat = num(b.lat, -90, 90);
  const lng = num(b.lng, -180, 180);
  if (lat === null || lng === null) return bad('Invalid coordinates');
  if (b.lat !== undefined && b.lat !== '' && b.lng !== undefined && b.lng !== '') {
    doc.lat = lat;
    doc.lng = lng;
  }
  if (b.translations && typeof b.translations === 'object') {
    const t: Record<string, Record<string, string>> = {};
    for (const lang of LANGS) {
      const src = b.translations[lang];
      if (!src || typeof src !== 'object') continue;
      const entry: Record<string, string> = {};
      const tt = str(src.title, 200);
      const tl = str(src.location, 200);
      const td = str(src.description, 5000, true);
      if (tt) entry.title = tt;
      if (tl) entry.location = tl;
      if (td) entry.description = td;
      if (Object.keys(entry).length) t[lang] = entry;
    }
    if (Object.keys(t).length) doc.translations = t;
  }

  try {
    const ref = await adminDb.collection('properties').add(doc);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error('[admin/properties] add error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return bad('Invalid id');
  try {
    await adminDb.collection('properties').doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/properties] delete error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
