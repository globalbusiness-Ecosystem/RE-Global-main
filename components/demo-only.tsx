'use client';
import type { ReactNode } from 'react';
import { useShowDemo } from '@/lib/use-demo-listings';

// Wraps the built-in sample listings: shown unless the admin switched them off.
export function DemoOnly({ children }: { children: ReactNode }) {
  return useShowDemo() ? <>{children}</> : null;
}
