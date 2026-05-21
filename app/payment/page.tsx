'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window { Pi: any; }
}

export default function PaymentPage() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (window.Pi) {
      window.Pi.init({ version: '2.0', sandbox: false });
    }
  }, []);

  const handlePayment = async () => {
    if (!window.Pi) return setStatus('Pi SDK غير متاح');
    setStatus('جاري المعالجة...');
    window.Pi.createPayment({
      amount: 1,
      memo: 'Property Listing Fee - RE Global',
      metadata: { type: 'listing' },
    }, {
      onReadyForServerApproval: (paymentId: string) => {
        setStatus('تمت الموافقة ✅');
      },
      onReadyForServerCompletion: (txid: string) => {
        setStatus('تمت العملية بنجاح 🎉');
      },
      onCancel: () => setStatus('تم الإلغاء'),
      onError: (err: any) => setStatus('خطأ: ' + err.message),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">دفع رسوم الإدراج</h1>
      <p className="text-gray-500">1 Pi مقابل إدراج عقارك على RE Global</p>
      <button
        onClick={handlePayment}
        className="bg-purple-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-purple-700"
      >
        ادفع الآن بـ Pi
      </button>
      {status && <p className="text-center text-sm mt-2">{status}</p>}
    </div>
  );
}