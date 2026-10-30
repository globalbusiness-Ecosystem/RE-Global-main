import { describe, it, expect } from 'vitest';
import { REPLY_MAX, replyLabel, validateReply } from '@/lib/review-reply';

describe('validateReply', () => {
  it('trims, strips control characters and caps the length', () => {
    expect(validateReply('  thanks\nfor staying  ')).toEqual({ ok: true, reply: 'thanks for staying' });
    const r = validateReply('x'.repeat(REPLY_MAX + 50));
    expect(r.ok && r.reply.length).toBe(REPLY_MAX);
  });
  it('treats empty or missing as a removal', () => {
    expect(validateReply('')).toEqual({ ok: true, reply: '' });
    expect(validateReply(undefined)).toEqual({ ok: true, reply: '' });
    expect(validateReply(null)).toEqual({ ok: true, reply: '' });
  });
  it('rejects non-text', () => {
    expect(validateReply(5).ok).toBe(false);
    expect(validateReply({}).ok).toBe(false);
  });
  it('has a label for every language and falls back to English', () => {
    expect(replyLabel('ar')).toBe('رد الإدارة');
    expect(replyLabel('xx')).toBe('Reply from the host');
  });
});
