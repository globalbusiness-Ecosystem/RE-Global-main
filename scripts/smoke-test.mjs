// Run after a deploy:  node scripts/smoke-test.mjs https://your-site.vercel.app
// Read-only checks (GET, plus one POST that is refused before doing anything). It never logs in and sends no secrets.
const base = (process.argv[2] || 'https://re-global-main.vercel.app').replace(/\/+$/, '');
const results = [];

async function get(path, init = {}) {
  const res = await fetch(base + path, { redirect: 'manual', ...init });
  let text = '';
  try { text = await res.text(); } catch { /* ignore */ }
  return { res, text };
}
function check(name, ok, detail = '') { results.push({ name, ok: !!ok, detail }); }
async function run(name, fn) {
  try { await fn(); } catch (e) { check(name, false, 'error: ' + (e && e.message ? e.message : e)); }
}

await run('home page loads', async () => {
  const { res } = await get('/');
  check('home page loads', res.status === 200, 'status ' + res.status);
  const h = (n) => res.headers.get(n) || '';
  check('HSTS header', /max-age=\d{7,}/.test(h('strict-transport-security')));
  check('nosniff header', h('x-content-type-options') === 'nosniff');
  check('referrer-policy header', !!h('referrer-policy'));
  check('permissions-policy header', !!h('permissions-policy'));
  check('clickjacking protection (frame-ancestors)', /frame-ancestors/.test(h('content-security-policy')));
  check('CSP report-only header', /report-uri/.test(h('content-security-policy-report-only')));
});

await run('health endpoint', async () => {
  const { res, text } = await get('/api/system-health');
  let j = {}; try { j = JSON.parse(text); } catch { /* ignore */ }
  check('health endpoint answers', [200, 503].includes(res.status) && !!j.status, 'status ' + res.status + ' ' + (j.status || ''));
  check('health says healthy', j.status === 'healthy', JSON.stringify(j.checks || {}));
});

await run('admin API is closed', async () => {
  for (const p of ['/api/admin/audit', '/api/admin/backup', '/api/admin/payouts', '/api/admin/stats']) {
    const { res } = await get(p);
    check('401 without admin session: ' + p, res.status === 401, 'status ' + res.status);
  }
  const { res } = await get('/api/admin/audit');
  check('admin responses are not cached', /no-store/.test(res.headers.get('cache-control') || ''));
});

await run('admin pages redirect', async () => {
  const { res } = await get('/admin/anything');
  const loc = res.headers.get('location') || '';
  check('/admin/* redirects to login', [307, 308, 302].includes(res.status) && /\/admin\/?$/.test(loc), 'status ' + res.status + ' -> ' + loc);
});

await run('admin login info', async () => {
  const { res, text } = await get('/api/admin-auth');
  let j = {}; try { j = JSON.parse(text); } catch { /* ignore */ }
  check('login endpoint answers, not logged in', res.status === 200 && j.ok === false, 'status ' + res.status);
  results.push({ name: 'INFO two-step login (2FA) is ' + (j.twoFactor ? 'ON' : 'OFF'), ok: true, detail: j.twoFactor ? '' : 'turn it on: see docs/OPERATIONS.md' });
});

await run('payment route refuses anonymous calls', async () => {
  const { res } = await get('/api/payments/approve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  check('payments/approve refuses without login', [400, 401, 403].includes(res.status), 'status ' + res.status);
});

await run('public data', async () => {
  const p = await get('/api/pricing');
  check('pricing endpoint answers', p.res.status === 200, 'status ' + p.res.status);
  const r = await get('/robots.txt');
  check('robots.txt hides /admin and /api', /Disallow:\s*\/admin/.test(r.text) && /Disallow:\s*\/api\//.test(r.text));
  const s = await get('/.well-known/security.txt');
  results.push({ name: 'INFO security.txt is ' + (s.res.status === 200 ? 'published' : 'not published (set SECURITY_CONTACT_EMAIL to publish)'), ok: true, detail: '' });
});

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail ? '  [' + r.detail + ']' : ''));
}
console.log('\n' + (failed ? failed + ' check(s) FAILED' : 'All checks passed') + ' for ' + base);
process.exit(failed ? 1 : 0);
