'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { cr } from '@/lib/card-return-labels';

// Shown after the payment company's page. It never claims the payment succeeded: only the signed notification
// from the payment company marks an order as paid, so this page just says it is being confirmed.
export default function CardReturnPage() {
  const { language } = useLanguage();
  const rtl = language === 'ar' || language === 'ur';
  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-10 text-white">
      <h1 className="text-2xl font-bold">{cr('title', language)}</h1>
      <p className="text-sm text-gray-300">{cr('body', language)}</p>
      <Link href="/" className="text-sm text-gray-400 underline">{cr('home', language)}</Link>
    </main>
  );
}
