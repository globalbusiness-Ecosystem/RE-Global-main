'use client';

import { useState } from 'react';
import { adminApi, Btn } from './admin-ui';

// "Log out everywhere": cuts every admin session (this one too). Ask first, then go back to the login screen.
export default function RevokeSessions({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (!window.confirm('هتخرج من كل جلسات الأدمن على كل الأجهزة (وده الجهاز كمان). تكمل؟')) return;
    setBusy(true); setError('');
    try {
      await adminApi('/api/admin/revoke-sessions', { method: 'POST' });
      onUnauthorized();
    } catch (e: any) { setError(e.message || 'حصل خطأ'); setBusy(false); }
  };

  return (
    <div className="text-center">
      <Btn kind="ghost" onClick={run} disabled={busy}>🔒 اخرج من كل الجلسات</Btn>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
