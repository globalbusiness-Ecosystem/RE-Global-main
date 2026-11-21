'use client';

import type { ReactNode } from 'react';

export const GOLD = 'var(--accent)'; // the platform's gold token, so the admin follows the brand

export class UnauthorizedError extends Error {}

/** fetch + JSON; throws UnauthorizedError on 401 and Error(message) on any other failure. */
export async function adminApi<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new UnauthorizedError('Unauthorized');
  if (!res.ok || data?.ok === false) throw new Error(data?.error || 'حصل خطأ، حاول تاني');
  return data as T;
}

export function Card({ title, right, children, className = '' }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold" style={{ color: GOLD }}>{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-input p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Btn({
  children, onClick, kind = 'gold', disabled, type = 'button', small,
}: { children: ReactNode; onClick?: () => void; kind?: 'gold' | 'ghost' | 'danger'; disabled?: boolean; type?: 'button' | 'submit'; small?: boolean }) {
  const base = small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm';
  const look =
    kind === 'gold' ? 'bg-accent text-black hover:brightness-110'
    : kind === 'danger' ? 'bg-red-600 text-foreground hover:bg-red-500'
    : 'border border-border text-foreground hover:bg-muted';
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${look} rounded-lg font-bold transition disabled:opacity-50`}>
      {children}
    </button>
  );
}

export const inputCls =
  'w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold" style={{ color: GOLD }}>{label}</span>
      {children}
    </label>
  );
}

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: 'gray' | 'green' | 'gold' | 'red' | 'blue' }) {
  const tones = {
    gray: 'bg-muted text-foreground/80', green: 'bg-green-900/50 text-green-300',
    gold: 'bg-yellow-900/40 text-yellow-300', red: 'bg-red-900/50 text-red-300', blue: 'bg-blue-900/40 text-blue-300',
  };
  return <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

export const TYPE_LABELS: Record<string, string> = {
  buy: 'شراء', rent: 'إيجار', hotel: 'فندق', tokenized: 'Tokenized', abroad: 'خارج البلاد', offplan: 'أوف بلان', invest: 'استثمار', resale: 'إعادة بيع حصص',
};
export const STATUS_LABELS: Record<string, string> = { available: 'متاح', sold: 'مباع', under_construction: 'تحت الإنشاء' };

export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
