'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Stat, Empty, Badge, inputCls, fmtDate } from './admin-ui';

export default function UsersTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [users, setUsers] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [shown, setShown] = useState(30);

  const load = useCallback(() => {
    adminApi<{ users: any[] }>('/api/admin/users')
      .then((d) => setUsers(d.users))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setError(e.message)));
  }, [onUnauthorized]);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (users || []).filter((u) => {
      if (filter === 'banned' && !u.banned) return false;
      if (filter === 'buyers' && !u.contracts) return false;
      if (filter === 'verified' && !u.emailVerified) return false;
      return !s || [u.username, u.email].some((v) => String(v || '').toLowerCase().includes(s));
    });
  }, [users, q, filter]);

  const toggleBan = async (u: any) => {
    let reason = '';
    if (!u.banned) {
      const r = prompt(`سبب حظر @${u.username}؟ (اختياري)\nالحظر بيمنعه من تسجيل الدخول والدفع وتوقيع العقود.`);
      if (r === null) return;
      reason = r;
    } else if (!confirm(`إلغاء حظر @${u.username}؟`)) return;
    try {
      await adminApi('/api/admin/users', { method: 'POST', body: JSON.stringify({ username: u.username, banned: !u.banned, reason }) });
      load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized();
      else alert('❌ ' + e.message);
    }
  };

  if (error) return <Empty>❌ {error}</Empty>;
  if (!users) return <Empty>...جاري التحميل</Empty>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="المستخدمون" value={users.length} />
        <Stat label="مشترون" value={users.filter((u) => u.contracts).length} />
        <Stat label="محظورون" value={users.filter((u) => u.banned).length} />
      </div>
      <Card title="المستخدمون">
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={inputCls} placeholder="🔍 اسم المستخدم أو الإيميل" value={q} onChange={(e) => { setQ(e.target.value); setShown(30); }} />
          <select className={inputCls} value={filter} onChange={(e) => { setFilter(e.target.value); setShown(30); }}>
            <option value="all">الكل</option><option value="buyers">لديهم عقود</option><option value="verified">إيميل موثّق</option><option value="banned">محظورون</option>
          </select>
        </div>
        <p className="mt-2 text-[11px] text-gray-500">القائمة تضم من لديه ملف شخصي أو وقّع عقداً أو تم حظره. الحظر يسري خلال 30 ثانية.</p>
      </Card>
      {filtered.length === 0 && <Empty>مفيش مستخدمين مطابقين.</Empty>}
      {filtered.slice(0, shown).map((u) => (
        <div key={u.username} className={`flex items-center justify-between gap-3 rounded-2xl border bg-[#141414] p-3 ${u.banned ? 'border-red-900' : 'border-[#2a2a2a]'}`}>
          <div className="min-w-0">
            <p className="truncate font-bold text-white">@{u.username}</p>
            {u.email && <p className="truncate text-xs text-gray-400" dir="ltr">{u.email}</p>}
            <div className="mt-1 flex flex-wrap gap-1">
              {u.banned && <Badge tone="red">محظور{u.banReason ? `: ${u.banReason}` : ''}</Badge>}
              {u.emailVerified && <Badge tone="green">إيميل موثّق</Badge>}
              {u.contracts > 0 && <Badge tone="gold">{u.contracts} عقد · {u.spent} π</Badge>}
            </div>
            {u.lastActivity && <p className="mt-1 text-[11px] text-gray-600">آخر نشاط: {fmtDate(u.lastActivity)}</p>}
          </div>
          <Btn small kind={u.banned ? 'ghost' : 'danger'} onClick={() => toggleBan(u)}>{u.banned ? 'إلغاء الحظر' : '🚫 حظر'}</Btn>
        </div>
      ))}
      {filtered.length > shown && <div className="text-center"><Btn kind="ghost" onClick={() => setShown(shown + 30)}>عرض المزيد ({filtered.length - shown})</Btn></div>}
    </div>
  );
}
