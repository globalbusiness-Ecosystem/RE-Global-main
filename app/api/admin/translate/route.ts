import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { isAdminRequest } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const TARGETS = ['ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const src = {
    title: clean(b?.title, 200),
    location: clean(b?.location, 200),
    description: clean(b?.description, 5000),
  };
  if (!src.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Translation is not configured' }, { status: 500 });

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 6000,
      system:
        'You translate real-estate listing text. Translate the given JSON fields (title, location, description) from their source language into: ' +
        'ar (Arabic), fr (French), es (Spanish), pt (Portuguese), ur (Urdu), zh (Simplified Chinese). ' +
        'Keep proper nouns, numbers and units accurate. Omit a field if its source is empty. ' +
        'Reply with ONLY a JSON object like {"ar":{"title":"","location":"","description":""},"fr":{...},"es":{...},"pt":{...},"ur":{...},"zh":{...}} and nothing else.',
      messages: [{ role: 'user', content: JSON.stringify(src) }],
    });
    const text = msg.content.map((c: any) => (c.type === 'text' ? c.text : '')).join('');
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const parsed = JSON.parse(json);
    const out: Record<string, Record<string, string>> = {};
    for (const lang of TARGETS) {
      const e = parsed?.[lang];
      if (!e || typeof e !== 'object') continue;
      const entry: Record<string, string> = {};
      const t = clean(e.title, 200), l = clean(e.location, 200), d = clean(e.description, 5000);
      if (t) entry.title = t;
      if (l) entry.location = l;
      if (d) entry.description = d;
      if (Object.keys(entry).length) out[lang] = entry;
    }
    return NextResponse.json({ translations: out });
  } catch (err) {
    console.error('[admin/translate] error:', err);
    return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
  }
}
