'use client';
import { toCsv } from '@/lib/csv';

// Downloads rows as a CSV file (UTF-8 with BOM so Excel shows Arabic correctly).
export function downloadCsv(name: string, headers: string[], rows: unknown[][]): void {
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff) + toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
