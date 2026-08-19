'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';

export default function SecondaryMarketPage() {
  const { accessToken } = usePiAuth();

  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [amountIn, setAmountIn] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; amountOut?: number; error?: string } | null>(null);

  async function handleSwap() {
    setLoading(true);
    setResult(null);
    try {
      if (!accessToken) {
        setResult({ success: false, error: 'لازم تسجل دخول بـ Pi الأول' });
        return;
      }
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ direction, amountIn: Number(amountIn) }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: 'حصل خطأ في الاتصال' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold text-amber-500 mb-6">السوق الثانوي — RE / Pi</h1>

      <div className="max-w-sm space-y-4">
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2 rounded ${direction === 'buy' ? 'bg-amber-500 text-black' : 'bg-slate-800'}`}
            onClick={() => setDirection('buy')}
          >
            شراء RE
          </button>
          <button
            className={`flex-1 py-2 rounded ${direction === 'sell' ? 'bg-amber-500 text-black' : 'bg-slate-800'}`}
            onClick={() => setDirection('sell')}
          >
            بيع RE
          </button>
        </div>

        <input
          type="number"
          placeholder={direction === 'buy' ? 'الكمية بالـ Pi' : 'الكمية بالـ RE'}
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
        />

        <button
          onClick={handleSwap}
          disabled={loading || !amountIn}
          className="w-full py-3 rounded bg-amber-500 text-black font-bold disabled:opacity-50"
        >
          {loading ? 'جارٍ التنفيذ...' : 'نفّذ الصفقة'}
        </button>

        {result && (
          <div className={`p-3 rounded ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
            {result.success ? `تم! استلمت: ${result.amountOut}` : `خطأ: ${result.error}`}
          </div>
        )}
      </div>
    </div>
  );
}
