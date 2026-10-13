'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardTab from '@/components/admin/dashboard-tab';
import PropertiesTab from '@/components/admin/properties-tab';
import PaymentsTab from '@/components/admin/payments-tab';
import UsersTab from '@/components/admin/users-tab';
import ContentTab from '@/components/admin/content-tab';

const TABS = [
  { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
  { id: 'properties', icon: '🏠', label: 'العقارات' },
  { id: 'payments', icon: '💳', label: 'المدفوعات' },
  { id: 'users', icon: '👥', label: 'المستخدمون' },
  { id: 'content', icon: '🧩', label: 'المحتوى' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<TabId>('dashboard');

  useEffect(() => {
    fetch('/api/admin-auth')
      .then((res) => res.json())
      .then((data) => setAuthenticated(!!data.ok))
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingSession(false));
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
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) { setAuthenticated(true); setPin(''); }
      else setLoginError(res.status === 429 ? 'محاولات كتير، استنى شوية وحاول تاني.' : 'PIN غلط!');
    } catch {
      setLoginError('حصل خطأ في الاتصال، حاول تاني.');
    }
  };

  const logout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' }).catch(() => undefined);
    setAuthenticated(false);
  };

  if (checkingSession) return null;

  if (!authenticated) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="w-full max-w-sm rounded-2xl border border-[#d4af37] bg-[#141414] p-8 text-center">
          <h1 className="mb-5 text-xl font-bold text-[#d4af37]">🔐 لوحة تحكم RE Global</h1>
          <input type="password" autoComplete="current-password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)}
            className="mb-3 w-full rounded-lg border border-[#d4af37] bg-[#0a0a0a] px-3 py-3 text-center text-white focus:outline-none" />
          {loginError && <p className="mb-3 text-sm text-red-400">{loginError}</p>}
          <button type="submit" className="w-full rounded-lg bg-[#d4af37] py-3 font-bold text-black">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0a0a0a] text-white md:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-56 shrink-0 border-l border-[#222] bg-[#0f0f0f] p-4 md:flex md:flex-col">
        <h1 className="mb-6 text-lg font-bold text-[#d4af37]">🏠 RE Global</h1>
        <nav className="flex flex-1 flex-col gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => go(t.id)}
              className={`rounded-lg px-3 py-2.5 text-right text-sm font-semibold transition ${tab === t.id ? 'bg-[#d4af37] text-black' : 'text-gray-300 hover:bg-[#1c1c1c]'}`}>
              {t.icon} {t.label}
            </button>
          ))}
          <a href="/admin/security" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-[#1c1c1c]">🛡️ الأمان</a>
          <a href="/" target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-[#1c1c1c]">🌐 فتح الموقع</a>
        </nav>
        <button onClick={logout} className="rounded-lg border border-[#333] py-2 text-sm text-gray-400 hover:bg-[#1c1c1c]">تسجيل خروج</button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#222] bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur md:hidden">
          <h1 className="font-bold text-[#d4af37]">🏠 RE Global — الأدمن</h1>
          <button onClick={logout} className="text-xs text-gray-400">خروج</button>
        </header>
        <main className="mx-auto w-full max-w-5xl p-4 md:p-6">
          <h2 className="mb-4 hidden text-xl font-bold md:block">{TABS.find((t) => t.id === tab)?.icon} {TABS.find((t) => t.id === tab)?.label}</h2>
          {tab === 'dashboard' && <DashboardTab onUnauthorized={expired} goto={go} />}
          {tab === 'properties' && <PropertiesTab onUnauthorized={expired} />}
          {tab === 'payments' && <PaymentsTab onUnauthorized={expired} />}
          {tab === 'users' && <UsersTab onUnauthorized={expired} />}
          {tab === 'content' && <ContentTab onUnauthorized={expired} />}
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-[#222] bg-[#0f0f0f] md:hidden">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => go(t.id)} className={`py-2.5 text-[11px] font-semibold ${tab === t.id ? 'text-[#d4af37]' : 'text-gray-400'}`}>
            <span className="block text-lg leading-none">{t.icon}</span>{t.label}
          </button>
        ))}
        <a href="/admin/security" className="py-2.5 text-center text-[11px] font-semibold text-gray-400">
          <span className="block text-lg leading-none">🛡️</span>الأمان
        </a>
      </nav>
    </div>
  );
}
