import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const src = (p: string) => readFileSync(p, 'utf8');
const ver = (v: string) => v.replace(/^[^\d]*/, '').split('.').map(Number);
const atLeast = (v: string, min: string) => { const a = ver(v), b = ver(min); for (let i = 0; i < 3; i++) { if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0); } return true; };

describe('supply chain', () => {
  it('nodemailer is on a patched version (address-parsing advisories fixed in 10.1.4)', () => {
    const pkg = JSON.parse(src('package.json'));
    expect(atLeast(pkg.dependencies.nodemailer, '10.1.4')).toBe(true);
  });
  it('the vulnerable AI SDK helper cannot come back in below 4.0.33', () => {
    expect(src('pnpm-workspace.yaml')).toContain("'@ai-sdk/provider-utils@<4.0.33': '^4.0.33'");
  });
  it('dependencies are audited on every push and weekly, and the audit can fail the build', () => {
    const w = src('.github/workflows/security.yml');
    expect(w).toContain('pnpm audit --prod');
    expect(w).toContain('schedule:');
    expect(w).toContain('--frozen-lockfile');
    expect(w).toContain('contents: read');
  });
  it('static analysis and automatic dependency updates are configured', () => {
    expect(src('.github/workflows/codeql.yml')).toContain('github/codeql-action/analyze@v3');
    const d = src('.github/dependabot.yml');
    expect(d).toContain('package-ecosystem: npm');
    expect(d).toContain('package-ecosystem: github-actions');
  });
  it('there is a disclosure policy', () => {
    expect(existsSync('SECURITY.md')).toBe(true);
    expect(src('SECURITY.md')).toContain('security.txt');
  });
  it('every workflow runs with read-only permissions unless it needs more', () => {
    for (const f of ['ci.yml', 'security.yml', 'codeql.yml']) expect(src(`.github/workflows/${f}`)).toMatch(/permissions:\s*\n\s+contents: read/);
  });
});
