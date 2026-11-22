'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardTab from '@/components/admin/dashboard-tab';
import PropertiesTab from '@/components/admin/properties-tab';
import PaymentsTab from '@/components/admin/payments-tab';
import UsersTab from '@/components/admin/users-tab';
import ContentTab from '@/components/admin/content-tab';
import IdleGuard from '@/components/admin/idle-guard';
import AdminsPanel from '@/components/admin/admins-panel';
import { TAB_ACCESS, isRole, type AdminRole } from '@/lib/admin-roles';
import { passkeysAvailable, answerChallenge } from '@/lib/passkey-client';

const TABS = [
  { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
  { id: 'properties', icon: '🏠', label: 'العقارات' },
  { id: 'payments', icon: '💳', label: 'المدفوعات' },
  { id: 'users', icon: '👥', label: 'المستخدمون' },
  { id: 'content', icon: '🧩', label: 'المحتوى' },
  { id: 'admins', icon: '🛡️', label: 'الأدمن' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [deviceCanPasskey, setDeviceCanPasskey] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<TabId>('dashboard');
  const [role, setRole] = useState<AdminRole>('owner');
  const [staffMode, setStaffMode] = useState(false);
  const [username, setUsername] = useState('');
  const tabs = TABS.filter((t) => TAB_ACCESS[role].includes(t.id));

  useEffect(() => {
    fetch('/api/admin-auth')
      .then((res) => res.json())
      .then((data) => { setAuthenticated(!!data.ok); if (isRole(data.role)) setRole(data.role); setTwoFactor(!!data.twoFactor); setHasPasskey(!!data.passkey); })
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingSession(false));
    passkeysAvailable().then(setDeviceCanPasskey);
    try {
      const saved = localStorage.getItem('admin_tab') as TabId | null;
      if (saved && TABS.some((t) => t.id === saved)) setTab(saved);
    } catch { /* storage unavailable */ }
  }, []);

  const go = (t: string) => {
    setTab(t as TabId);
    try { localStorage.setItem('admin_tab', t); } catch { /* ignore */ }
  };
  // Called by any tab when the server says the session is gone.
  const expired = useCallback(() => setAuthenticated(false), []);

  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch(staffMode ? '/api/admin-auth/staff' : '/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffMode ? { username, pin } : { pin, code }),
      });
      if (res.ok) {
        const who = await fetch('/api/admin-auth', { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
        setRole(isRole(who?.role) ? who.role : 'owner');
        setTab('dashboard');
        setAuthenticated(true); setPin(''); setCode(''); setUsername('');
      }
      else setLoginError(res.status === 429 ? 'محاولات كتير، استنى شوية وحاول تاني.' : twoFactor ? 'PIN أو الكود غلط!' : 'PIN غلط!');
    } catch {
      setLoginError('حصل خطأ في الاتصال، حاول تاني.');
    }
  };

  // PIN + fingerprint: the server checks the PIN on both calls, the device signs the challenge in between.
  const handlePasskeyLogin = async () => {
    if (!pin || passkeyBusy) { if (!pin) setLoginError('اكتب الـ PIN الأول، وبعدها اضغط الدخول بالبصمة.'); return; }
    setLoginError(''); setPasskeyBusy(true);
    try {
      const post = (body: object) => fetch('/api/admin-auth/passkey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin, ...body }) });
      const o = await post({ step: 'options' });
      if (!o.ok) { setLoginError(o.status === 429 ? 'محاولات كتير، استنى شوية وحاول تاني.' : 'PIN غلط أو البصمة مش متاحة!'); return; }
      const od = await o.json();
      const response = await answerChallenge(od.options);
      if (!response) { setLoginError('اتلغت البصمة.'); return; }
      const v = await post({ step: 'verify', challengeId: od.challengeId, response });
      if (v.ok) { setAuthenticated(true); setPin(''); setCode(''); }
      else setLoginError(v.status === 429 ? 'محاولات كتير، استنى شوية وحاول تاني.' : 'البصمة أو الـ PIN مش مقبولين!');
    } catch { setLoginError('حصل خطأ، حاول تاني.'); }
    finally { setPasskeyBusy(false); }
  };

  const logout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' }).catch(() => undefined);
    setAuthenticated(false);
  };

  if (checkingSession) return null;

  if (!authenticated) {
    return (
      <div dir="rtl" className="dark flex min-h-screen items-center justify-center bg-background p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="w-full max-w-sm rounded-2xl border border-accent bg-card p-8 text-center">
          <h1 className="mb-5 text-xl font-bold text-accent">🔐 لوحة تحكم RE Global</h1>
          {staffMode && (
            <input type="text" autoComplete="username" autoCapitalize="none" placeholder="اسم الدخول" aria-label="اسم الدخول" value={username} onChange={(e) => setUsername(e.target.value)}
              className="mb-3 w-full rounded-lg border border-accent bg-background px-3 py-3 text-center text-foreground focus:outline-none" />
          )}
          <input type="password" autoComplete="current-password" placeholder="PIN" aria-label="PIN" value={pin} onChange={(e) => setPin(e.target.value)}
            className="mb-3 w-full rounded-lg border border-accent bg-background px-3 py-3 text-center text-foreground focus:outline-none" />
          {twoFactor && !staffMode && (
            <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="كود التحقق (6 أرقام)" aria-label="كود التحقق (6 أرقام)" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mb-3 w-full rounded-lg border border-accent bg-background px-3 py-3 text-center tracking-widest text-foreground focus:outline-none" />
          )}
          {loginError && <p className="mb-3 text-sm text-red-400">{loginError}</p>}
          <button type="submit" className="w-full rounded-lg bg-accent py-3 font-bold text-black">دخول</button>
          <button type="button" onClick={() => { setStaffMode((v) => !v); setLoginError(''); }} className="mt-3 w-full text-xs text-muted-foreground underline">{staffMode ? 'دخول المالك' : 'دخول موظف'}</button>
          {hasPasskey && deviceCanPasskey && !staffMode && (
            <button type="button" disabled={passkeyBusy} onClick={handlePasskeyLogin} className="mt-3 w-full rounded-lg border border-accent py-3 font-bold text-accent disabled:opacity-60">{passkeyBusy ? 'في انتظار جهازك…' : '🔑 الدخول بالبصمة (مع الـ PIN)'}</button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div dir="rtl" className="dark min-h-screen bg-background text-foreground md:flex">
      <IdleGuard onTimeout={logout} />
      {/* Sidebar (desktop) */}
      <aside className="hidden w-56 shrink-0 border-l border-border bg-sidebar p-4 md:flex md:flex-col">
        <h1 className="mb-6 text-lg font-bold text-accent">🏠 RE Global</h1>
        <nav className="flex flex-1 flex-col gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => go(t.id)}
              className={`rounded-lg px-3 py-2.5 text-right text-sm font-semibold transition ${tab === t.id ? 'bg-accent text-black' : 'text-foreground/80 hover:bg-muted'}`}>
              {t.icon} {t.label}
            </button>
          ))}
          <a href="/admin/security" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-muted">🛡️ الأمان</a>
          <a href="/" target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-muted">🌐 فتح الموقع</a>
        </nav>
        <button onClick={logout} className="rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted">تسجيل خروج</button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <h1 className="font-bold text-accent">🏠 RE Global — الأدمن</h1>
          <button onClick={logout} className="text-xs text-muted-foreground">خروج</button>
        </header>
        <main className="mx-auto w-full max-w-5xl p-4 md:p-6">
          <h2 className="mb-4 hidden text-xl font-bold md:block">{TABS.find((t) => t.id === tab)?.icon} {TABS.find((t) => t.id === tab)?.label}</h2>
          {tab === 'dashboard' && <DashboardTab onUnauthorized={expired} goto={go} />}
          {tab === 'properties' && <PropertiesTab onUnauthorized={expired} />}
          {tab === 'payments' && <PaymentsTab onUnauthorized={expired} />}
          {tab === 'users' && <UsersTab onUnauthorized={expired} />}
          {tab === 'content' && <ContentTab onUnauthorized={expired} />}
          {tab === 'admins' && role === 'owner' && <AdminsPanel onUnauthorized={expired} />}
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }} className="fixed inset-x-0 bottom-0 z-20 grid border-t border-border bg-sidebar md:hidden">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => go(t.id)} className={`py-2.5 text-[11px] font-semibold ${tab === t.id ? 'text-accent' : 'text-muted-foreground'}`}>
            <span className="block text-lg leading-none">{t.icon}</span>{t.label}
          </button>
        ))}
        <a href="/admin/security" className="py-2.5 text-center text-[11px] font-semibold text-muted-foreground">
          <span className="block text-lg leading-none">🛡️</span>الأمان
        </a>
      </nav>
    </div>
  );
}
