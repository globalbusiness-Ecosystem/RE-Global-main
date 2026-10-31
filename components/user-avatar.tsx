/** @jsxRuntime automatic */
import { presetById, initialsOf } from '@/lib/avatar';

export interface AvatarState { preset?: string; photo?: string }

// Round profile picture: uploaded photo, preset avatar, or the user's initials.
export function UserAvatar({ avatar, username, size = 56, className = '' }: { avatar?: AvatarState | null; username?: string | null; size?: number; className?: string }) {
  const box = { width: size, height: size, fontSize: Math.round(size * 0.46) };
  const base = `rounded-full overflow-hidden flex items-center justify-center shrink-0 select-none ${className}`;
  if (avatar?.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatar.photo} alt="" width={size} height={size} className={`${base} object-cover`} style={box} draggable={false} />;
  }
  const preset = avatar?.preset ? presetById(avatar.preset) : undefined;
  if (preset) {
    return (
      <span aria-hidden className={base} style={{ ...box, background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}>
        {preset.emoji}
      </span>
    );
  }
  return (
    <span aria-hidden className={`${base} bg-accent/15 text-accent font-bold`} style={{ ...box, fontSize: Math.round(size * 0.38) }}>
      {initialsOf(username)}
    </span>
  );
}
