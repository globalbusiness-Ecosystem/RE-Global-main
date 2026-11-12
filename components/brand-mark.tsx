// The RE monogram with the brand glow, shown at the top of the sign-in and identity-check pages.
export function BrandMark() {
  return (
    <div aria-hidden className="mb-1 flex flex-col items-center gap-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/25 to-secondary/30 shadow-[0_0_40px_-8px_var(--accent)]">
        <span className="text-2xl font-black tracking-tight text-accent">RE</span>
      </div>
      <p className="text-[11px] tracking-[0.25em] text-muted-foreground">REAL ESTATE · REAL VALUE</p>
    </div>
  );
}
