import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Fails the build when a real-looking key, token or private key is committed.
// Secrets belong in Vercel environment variables; .env.example holds names only.
const PATTERNS: Record<string, RegExp> = {
  'private key': /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/,
  'Stellar/Pi secret seed': /\bS[A-D][A-Z2-7]{54}\b/,
  'Google API key': /\bAIza[0-9A-Za-z_-]{35}\b/,
  'GitHub token': /\b(?:ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/,
  'Stripe live key': /\b[sr]k_live_[0-9A-Za-z]{16,}\b/,
  'Slack token': /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/,
  'AWS access key id': /\bAKIA[0-9A-Z]{16}\b/,
  'Resend API key': /\bre_[A-Za-z0-9]{24,}\b/,
  'secret assigned in code': /\b(?:admin_pin|admin_session_secret|cron_secret|pi_api_key|resend_api_key|kyc_enc_key)\b\s*[:=]\s*['"](?!test|dummy|example|your|xxx|changeme)[^'"\s]{8,}['"]/i,
};
const SKIP = /(pnpm-lock\.yaml|\.(png|jpe?g|webp|ico|svg|woff2?|mp3|mp4|pdf)$)/i;

describe('no secrets in the repository', () => {
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter((f) => f && !SKIP.test(f));
  it('scans every tracked text file', () => {
    expect(files.length).toBeGreaterThan(100);
    const hits: string[] = [];
    for (const f of files) {
      let text = '';
      try { text = readFileSync(f, 'utf8'); } catch { continue; }
      for (const [name, re] of Object.entries(PATTERNS)) if (re.test(text)) hits.push(`${name}: ${f}`);
    }
    expect(hits, 'remove the secret, rotate it, and keep only its name in .env.example').toEqual([]);
  });
  it('the patterns really catch what they claim to (so a silent regex typo cannot hide a leak)', () => {
    const samples: Record<string, string> = {
      'private key': '-----BEGIN PRIVATE KEY-----',
      'Stellar/Pi secret seed': 'S' + 'A' + 'B'.repeat(54),
      'Google API key': 'AIza' + 'a'.repeat(35),
      'GitHub token': 'ghp_' + 'a'.repeat(36),
      'Stripe live key': 'sk_live_' + 'a'.repeat(20),
      'Slack token': 'xoxb-' + '1'.repeat(12),
      'AWS access key id': 'AKIA' + 'A'.repeat(16),
      'Resend API key': 're_' + 'a'.repeat(26),
      'secret assigned in code': "ADMIN_PIN = 'abcdefgh1234'",
    };
    for (const [name, re] of Object.entries(PATTERNS)) expect(re.test(samples[name]), name).toBe(true);
    expect(PATTERNS['secret assigned in code'].test("PI_API_KEY = 'test-key-123456'")).toBe(false);
  });
  it('real env files are never tracked', () => {
    expect(files.filter((f) => /(^|\/)\.env(\.(local|production|development))?$/.test(f))).toEqual([]);
  });
});
