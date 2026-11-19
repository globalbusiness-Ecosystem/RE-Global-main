import { NextRequest, NextResponse } from 'next/server';
import { parseRefCode } from '@/lib/ref-code';

// The one invite path: https://site/r/CODE. It opens the app and the code is kept until the visitor signs in.
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const code = parseRefCode((await ctx.params).code);
  const url = new URL('/', req.url);
  if (code) url.searchParams.set('ref', code);
  return NextResponse.redirect(url, 307);
}
