export const FOUNDER_CARD_CLASS = 'border-[#d4af37]/70 shadow-[0_0_40px_-10px_rgba(212,175,55,0.55)]';
export const FOUNDER_NAME_CLASS = 'bg-gradient-to-r from-[#f6e08a] via-[#d4af37] to-[#f6e08a] bg-clip-text text-transparent';

/** Put inside the (relative, rounded) wrapper of the avatar, before the picture. */
export function FounderRing() {
  return (
    <>
      <style>{`@keyframes rg-founder-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.rg-founder-ring{animation:none!important}}`}</style>
      <span aria-hidden className="rg-founder-ring absolute -inset-1.5 rounded-full" style={{ background: 'conic-gradient(from 0deg,#f6e08a,#d4af37,#7a5c10,#f6e08a,#d4af37,#f6e08a)', animation: 'rg-founder-spin 7s linear infinite' }} />
      <span aria-hidden className="absolute -inset-0.5 rounded-full bg-card" />
    </>
  );
}

/** Put inside the cover banner: a soft gold light from the corner. */
export function FounderCoverSheen() {
  return <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(246,224,138,0.35) 0%, rgba(212,175,55,0.12) 35%, transparent 65%)' }} />;
}
