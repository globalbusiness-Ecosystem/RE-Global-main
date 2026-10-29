import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

const TONES = {
  accent: 'bg-accent/10 text-accent',
  green: 'bg-emerald-500/10 text-emerald-500',
  red: 'bg-red-500/10 text-red-400',
  blue: 'bg-blue-500/10 text-blue-400',
} as const;

// One look for every icon in a list or a section header: a tinted rounded square with the icon centered.
export function IconBadge({ icon: Icon, tone = 'accent', size = 'md' }: { icon: LucideIcon; tone?: keyof typeof TONES; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  return (
    <span aria-hidden className={`inline-flex ${box} shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}>
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
    </span>
  );
}

// "Go forward" arrow at the end of a row. It points the right way in both left-to-right and right-to-left pages.
export function RowChevron({ className = '' }: { className?: string }) {
  return <ChevronRight aria-hidden className={`h-4 w-4 shrink-0 rtl:rotate-180 ${className || 'text-muted-foreground'}`} />;
}
