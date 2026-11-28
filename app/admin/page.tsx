'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardTab from '@/components/admin/dashboard-tab';
import PropertiesTab from '@/components/admin/properties-tab';
import PaymentsTab from '@/components/admin/payments-tab';
import UsersTab from '@/components/admin/users-tab';
import ContentTab from '@/components/admin/content-tab';
import IdleGuard from '@/components/admin/idle-guard';
import AdminsPanel from '@/components/admin/admins-panel';
import QuickNav from '@/components/admin/quick-nav';
import { AdminLangContext } from '@/components/admin/admin-lang';
import { LANG_KEY, dirOf, otherLang, parseLang, tabLabel, tr, type AdminLang } from '@/lib/admin-i18n';
import { NAV, NAV_EVENT, SUB_STORE_PREFIX, type NavEntry } from '@/lib/admin-nav';
import { TAB_ACCESS, isRole, type AdminRole } from '@/lib/admin-roles';
import { passkeysAvailable, answerChallenge } from '@/lib/passkey-client';
import QRCode from 'qrcode';

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
  const [quick, setQuick] = useState(false);
  const [lang, setLangState] = useState<AdminLang>('ar');
  const [role, setRole] = useState<AdminRole>('owner');
  const [staffMode, setStaffMode] = useState(false);
  const [username, setUsername] = useState('');
  const [staffCode, setStaffCode] = useState(false); // this staff account needs an authenticator code
  const [enroll, setEnroll] = useState<{ secret: string; qr: string } | null>(null); // setting the app up
  const tabs = TABS.filter((t) => TAB_ACCESS[role].includes(t.id));

  useEffect(() => {
    fetch('/api/admin-auth')
      .then((res) => res.json())
      .then((data) => { setAuthenticated(!!data.ok); if (isRole(data.role)) setRole(data.role); setTwoFactor(!!data.twoFactor); setHasPasskey(!!data.passkey); })
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingSession(false));
    passkeysAvailable().then(setDeviceCanPasskey);
    try {
      setLangState(parseLang(localStorage.getItem(LANG_KEY)));
      const saved = localStorage.getItem('admin_tab') as TabId | null;
      if (saved && TABS.some((t) => t.id === saved)) setTab(saved);
    } catch { /* storage unavailable */ }
  }, []);

  const go = (t: string) => {
    setTab(t as TabId);
    try { localStorage.setItem('admin_tab', t); } catch { /* ignore */ }
  };
  const setLang = (l: AdminLang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  };
  // "Jump to": Ctrl/Cmd+K or the search button opens a box that lists every section.
  useEffect(() => {
    if (!authenticated) return;
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); setQuick((v) => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authenticated]);
  const navEntries = NAV.filter((n) => tabs.some((t) => t.id === n.tab));
  const pick = (n: NavEntry) => {
    setQuick(false);
    if (n.storeKey && n.sub) { try { localStorage.setItem(SUB_STORE_PREFIX + n.storeKey, n.sub); } catch { /* ignore */ } }
    go(n.tab);
    // A section that is already open switches tab on this event; one that has to open first reads the saved tab itself.
    if (n.storeKey && n.sub) setTimeout(() => window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: { storeKey: n.storeKey, id: n.sub } })), 60);
  };
  // Called by any tab when the server says the session is gone.
  const expired = useCallback(() => setAuthenticated(false), []);

  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch(staffMode ? '/api/admin-auth/staff' : '/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffMode ? { username, pin, code } : { pin, code }),
      });
      if (res.ok) {
        const who = await fetch('/api/admin-auth', { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
        setRole(isRole(who?.role) ? who.role : 'owner');
        setTab('dashboard');
        setAuthenticated(true); setPin(''); setCode(''); setUsername('');
      }
      else if (staffMode && res.status === 401) {
        const d = await res.json().catch(() => ({}));
        if (d?.needCode) { setStaffCode(true); setLoginError(code ? 'الكود غلط أو اتستخدم قبل كده.' : 'اكتب الكود من تطبيق المصادقة.'); }
        else if (d?.needEnroll) await startEnroll();
        else setLoginError('الاسم أو الـ PIN أو الكود غلط!');
      }
      else setLoginError(res.status === 429 ? 'محاولات كتير، استنى شوية وحاول تاني.' : twoFactor ? 'PIN أو الكود غلط!' : 'PIN غلط!');
    } catch {
      setLoginError('حصل خطأ في الاتصال، حاول تاني.');
    }
  };

  // Setting up the authenticator app (the PIN proves who is asking; the secret is shown once).
  const startEnroll = async () => {
    const r = await fetch('/api/admin-auth/staff-totp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, pin, step: 'begin' }) });
    if (!r.ok) { setLoginError(r.status === 429 ? 'محاولات كتير، استنى شوية وحاول تاني.' : 'مش قادر أبدأ تفعيل التطبيق. كلّم المالك.'); return; }
    const d = await r.json();
    setEnroll({ secret: d.secret, qr: await QRCode.toDataURL(d.uri, { width: 220, margin: 1 }) });
    setCode(''); setLoginError('');
  };
  const confirmEnroll = async () => {
    const r = await fetch('/api/admin-auth/staff-totp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, pin, step: 'confirm', code }) });
    if (!r.ok) { setLoginError(r.status === 429 ? 'محاولات كتير، استنى شوية وحاول تاني.' : 'الكود غلط، جرّب الكود الحالي.'); return; }
    setEnroll(null); setStaffCode(true); setCode('');
    setLoginError('اتفعّل التطبيق. استنى الكود الجديد (حوالي 30 ثانية) واكتبه واضغط دخول.');
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
          {enroll && staffMode && (
            <div className="mb-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground">
              <p className="mb-2">افتح تطبيق مصادقة (Google/Microsoft Authenticator) وامسح الكود، أو اكتب المفتاح بإيدك:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enroll.qr} alt="QR" width={220} height={220} className="mx-auto rounded bg-white" />
              <p className="mt-2 select-all break-all font-mono text-xs" dir="ltr">{enroll.secret}</p>
              <p className="mt-2 text-xs text-muted-foreground">بعدها اكتب أول كود ظهر في التطبيق واضغط «تأكيد التفعيل».</p>
              <button type="button" onClick={confirmEnroll} disabled={code.length !== 6} className="mt-2 w-full rounded-lg border border-accent py-2 font-bold text-accent disabled:opacity-60">تأكيد التفعيل</button>
            </div>
          )}
          {((twoFactor && !staffMode) || (staffMode && (staffCode || enroll))) && (
            <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="كود التحقق (6 أرقام)" aria-label="كود التحقق (6 أرقام)" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mb-3 w-full rounded-lg border border-accent bg-background px-3 py-3 text-center tracking-widest text-foreground focus:outline-none" />
          )}
          {loginError && <p className="mb-3 text-sm text-red-400">{loginError}</p>}
          <button type="submit" className="w-full rounded-lg bg-accent py-3 font-bold text-black">دخول</button>
          <button type="button" onClick={() => { setStaffMode((v) => !v); setLoginError(''); setStaffCode(false); setEnroll(null); setCode(''); }} className="mt-3 w-full text-xs text-muted-foreground underline">{staffMode ? 'دخول المالك' : 'دخول موظف'}</button>
          {hasPasskey && deviceCanPasskey && !staffMode && (
            <button type="button" disabled={passkeyBusy} onClick={handlePasskeyLogin} className="mt-3 w-full rounded-lg border border-accent py-3 font-bold text-accent disabled:opacity-60">{passkeyBusy ? 'في انتظار جهازك…' : '🔑 الدخول بالبصمة (مع الـ PIN)'}</button>
          )}
        </form>
      </div>
    );
  }

  return (
    <AdminLangContext.Provider value={{ lang, setLang }}>
    <div dir={dirOf(lang)} lang={lang} className="dark min-h-screen bg-background text-foreground md:flex">
      <IdleGuard onTimeout={logout} />
      {/* Sidebar (desktop) */}
      <aside aria-label={tr('sidebarAria', lang)} className="hidden w-56 shrink-0 border-e border-border bg-sidebar p-4 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:self-start md:overflow-y-auto">
        <h1 className="mb-6 text-lg font-bold text-accent">🏠 RE Global</h1>
        <nav aria-label={tr('sectionsAria', lang)} className="flex flex-1 flex-col gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined}
              className={`rounded-lg px-3 py-2.5 text-start text-sm font-semibold transition ${tab === t.id ? 'bg-accent text-black' : 'text-foreground/80 hover:bg-muted'}`}>
              {t.icon} {tabLabel(t.id, lang, t.label)}
            </button>
          ))}
          <button onClick={() => setQuick(true)} className="rounded-lg px-3 py-2.5 text-start text-sm font-semibold text-foreground/80 hover:bg-muted">🔎 {tr('quick', lang)} <span className="text-xs opacity-60" dir="ltr">Ctrl+K</span></button>
          <a href="/admin/security" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-muted">🛡️ {tr('security', lang)}</a>
          <a href="/" target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-muted">🌐 {tr('openSite', lang)}</a>
        </nav>
        <button onClick={() => setLang(otherLang(lang))} aria-label={tr('langAria', lang)} className="mb-2 rounded-lg border border-border py-2 text-sm text-foreground/80 hover:bg-muted">🌍 {tr('langSwitch', lang)}</button>
        <button onClick={logout} className="rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted">{tr('logout', lang)}</button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <h1 className="font-bold text-accent">🏠 {tr('title', lang)}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setQuick(true)} aria-label={tr('quick', lang)} className="text-lg">🔎</button>
            <button onClick={() => setLang(otherLang(lang))} aria-label={tr('langAria', lang)} className="text-xs font-bold text-foreground/80">{tr('langSwitchShort', lang)}</button>
            <button onClick={logout} className="text-xs text-muted-foreground">{tr('logoutShort', lang)}</button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl p-4 md:p-6 xl:max-w-6xl 2xl:max-w-7xl">
          <h2 className="mb-4 hidden text-xl font-bold md:block">{TABS.find((t) => t.id === tab)?.icon} {tabLabel(tab, lang)}</h2>
          {tab === 'dashboard' && <DashboardTab onUnauthorized={expired} goto={go} />}
          {tab === 'properties' && <PropertiesTab onUnauthorized={expired} />}
          {tab === 'payments' && <PaymentsTab onUnauthorized={expired} />}
          {tab === 'users' && <UsersTab onUnauthorized={expired} />}
          {tab === 'content' && <ContentTab onUnauthorized={expired} />}
          {tab === 'admins' && role === 'owner' && <AdminsPanel onUnauthorized={expired} />}
        </main>
      </div>

      {quick && <QuickNav entries={navEntries} onPick={pick} onClose={() => setQuick(false)} />}

      {/* Bottom tab bar (mobile) */}
      <nav aria-label={tr('bottomAria', lang)} style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }} className="fixed inset-x-0 bottom-0 z-20 grid border-t border-border bg-sidebar md:hidden">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined} className={`py-2.5 text-[11px] font-semibold ${tab === t.id ? 'text-accent' : 'text-muted-foreground'}`}>
            <span className="block text-lg leading-none">{t.icon}</span>{tabLabel(t.id, lang, t.label)}
          </button>
        ))}
        <a href="/admin/security" className="py-2.5 text-center text-[11px] font-semibold text-muted-foreground">
          <span className="block text-lg leading-none">🛡️</span>{tr('security', lang)}
        </a>
      </nav>
    </div>
    </AdminLangContext.Provider>
  );
}
