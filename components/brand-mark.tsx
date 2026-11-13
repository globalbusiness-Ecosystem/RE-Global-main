// The platform logo (the admin can change it), shown at the top of the sign-in and identity-check pages.
import { BrandLogo } from '@/components/brand-logo';

export function BrandMark() {
  return (
    <div className="mb-1 flex flex-col items-center gap-2">
      <BrandLogo height={88} shape="wide" rounded="rounded-2xl" className="shadow-[0_0_40px_-8px_var(--accent)]" />
      <p aria-hidden className="text-[11px] tracking-[0.25em] text-muted-foreground">REAL ESTATE · REAL VALUE</p>
    </div>
  );
}
