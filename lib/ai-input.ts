import 'server-only';
import { NextResponse } from 'next/server';

// Input limits for the AI routes. Every authenticated user can call them, so an
// unbounded body or message list translates directly into model cost.

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Reads a JSON body with a hard size cap (checks Content-Length first, then the
 * real length). Returns the parsed object or a ready-made error response.
 */
export async function readJsonLimited(
  req: Request,
  maxBytes: number
): Promise<Record<string, unknown> | NextResponse> {
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > maxBytes) return bad('Request too large', 413);
  let text: string;
  try {
    text = await req.text();
  } catch {
    return bad('Invalid request');
  }
  if (text.length > maxBytes) return bad('Request too large', 413);
  try {
    const v = JSON.parse(text);
    if (!v || typeof v !== 'object' || Array.isArray(v)) return bad('Invalid request');
    return v as Record<string, unknown>;
  } catch {
    return bad('Invalid request');
  }
}

/** A trimmed string of 1..max chars, or null. */
export function cleanString(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  return s.length > 0 && s.length <= max ? s : null;
}

/** Text length of one chat message (AI SDK UI message `parts`, or legacy `content`). */
function messageChars(m: unknown): number {
  if (!m || typeof m !== 'object') return -1;
  const msg = m as { parts?: unknown; content?: unknown; role?: unknown };
  if (msg.role !== 'user' && msg.role !== 'assistant') return -1;
  if (typeof msg.content === 'string') return msg.content.length;
  if (Array.isArray(msg.parts)) {
    let n = 0;
    for (const p of msg.parts) {
      if (p && typeof p === 'object' && (p as any).type === 'text' && typeof (p as any).text === 'string') {
        n += (p as any).text.length;
      }
    }
    return n;
  }
  return -1;
}

/**
 * Validates a chat history: bounded number of messages and bounded text size.
 * Returns null when OK, or an error response.
 */
export function validateMessages(
  messages: unknown,
  opts: { maxMessages?: number; maxCharsPerMessage?: number; maxTotalChars?: number } = {}
): NextResponse | null {
  const maxMessages = opts.maxMessages ?? 30;
  const maxPer = opts.maxCharsPerMessage ?? 4000;
  const maxTotal = opts.maxTotalChars ?? 20000;
  if (!Array.isArray(messages) || messages.length === 0) return bad('Invalid messages');
  if (messages.length > maxMessages) return bad('Conversation too long');
  let total = 0;
  for (const m of messages) {
    const n = messageChars(m);
    if (n < 0) return bad('Invalid messages');
    if (n > maxPer) return bad('Message too long', 413);
    total += n;
  }
  if (total > maxTotal) return bad('Conversation too long', 413);
  return null;
}
