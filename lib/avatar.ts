// Profile picture: either one of the built-in presets or a small photo the user uploads.
// Pure helpers only (no browser or server APIs), so they can be tested and shared.

export const AVATAR_SIZE = 192;
export const AVATAR_MAX_BYTES = 40_000;
export const AVATAR_QUALITIES = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];

export interface AvatarPreset { id: string; emoji: string; from: string; to: string }

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'home', emoji: '🏠', from: '#f59e0b', to: '#ef4444' },
  { id: 'villa', emoji: '🏡', from: '#10b981', to: '#047857' },
  { id: 'tower', emoji: '🏙️', from: '#3b82f6', to: '#1d4ed8' },
  { id: 'palm', emoji: '🌴', from: '#14b8a6', to: '#0f766e' },
  { id: 'sun', emoji: '🌞', from: '#fbbf24', to: '#f97316' },
  { id: 'moon', emoji: '🌙', from: '#6366f1', to: '#312e81' },
  { id: 'star', emoji: '⭐', from: '#eab308', to: '#a16207' },
  { id: 'rocket', emoji: '🚀', from: '#8b5cf6', to: '#5b21b6' },
  { id: 'diamond', emoji: '💎', from: '#06b6d4', to: '#0e7490' },
  { id: 'key', emoji: '🔑', from: '#d97706', to: '#92400e' },
  { id: 'pyramid', emoji: '🔺', from: '#ec4899', to: '#9d174d' },
  { id: 'globe', emoji: '🌍', from: '#22c55e', to: '#1e40af' },
];

export function isPresetId(id: unknown): id is string {
  return typeof id === 'string' && AVATAR_PRESETS.some((p) => p.id === id);
}

export function presetById(id: string): AvatarPreset | undefined {
  return AVATAR_PRESETS.find((p) => p.id === id);
}

export type AvatarValue = { kind: 'preset'; id: string } | { kind: 'photo'; dataUrl: string };

const PHOTO_RE = /^data:image\/(jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

// Decodes the base64 part of a photo data URL, or null if it is not an acceptable jpeg/webp within the size cap.
export function decodePhoto(dataUrl: unknown): Uint8Array | null {
  if (typeof dataUrl !== 'string' || dataUrl.length > Math.ceil(AVATAR_MAX_BYTES * 4 / 3) + 64) return null;
  const m = PHOTO_RE.exec(dataUrl);
  if (!m) return null;
  const bytes = Uint8Array.from(Buffer.from(m[2], 'base64'));
  if (bytes.length === 0 || bytes.length > AVATAR_MAX_BYTES) return null;
  return bytes;
}

// Shape check only; the server additionally checks the real file signature.
export function validateAvatarPayload(body: unknown): AvatarValue | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.preset === 'string') return isPresetId(b.preset) ? { kind: 'preset', id: b.preset } : null;
  if (typeof b.photo === 'string') return decodePhoto(b.photo) ? { kind: 'photo', dataUrl: b.photo } : null;
  return null;
}

// Largest centred square inside a w x h picture.
export function centerSquare(w: number, h: number): { sx: number; sy: number; side: number } {
  const side = Math.max(1, Math.min(w, h));
  return { sx: Math.floor((w - side) / 2), sy: Math.floor((h - side) / 2), side };
}

// Tries descending qualities until the encoded picture fits; null if even the lowest is too big.
export function encodeUnderLimit(encode: (quality: number) => string | null, max = AVATAR_MAX_BYTES): string | null {
  for (const q of AVATAR_QUALITIES) {
    const out = encode(q);
    if (out && out.length <= Math.ceil(max * 4 / 3) + 64) return out;
  }
  return null;
}

export function initialsOf(username: string | null | undefined): string {
  const clean = (username || '').replace(/[^\p{L}\p{N}]/gu, '');
  return clean ? clean.slice(0, 2).toUpperCase() : '?';
}

export const AVATAR_I18N = {
  en: { change: 'Change profile picture', title: 'Profile picture', upload: 'Upload a photo', remove: 'Remove picture', choose: 'Or pick an avatar', saving: 'Saving…', failed: 'Could not save. Try again.', tooBig: 'This photo could not be shrunk enough. Try another.', badFile: 'Please choose a JPG, PNG or WebP photo.', privacy: 'Only you can see your picture.', done: 'Done', signIn: 'Sign in with Pi to set a picture.' },
  ar: { change: 'تغيير صورة الملف الشخصي', title: 'صورة الملف الشخصي', upload: 'ارفع صورتك', remove: 'حذف الصورة', choose: 'أو اختر أفاتار', saving: 'جارٍ الحفظ…', failed: 'تعذر الحفظ. حاول مرة أخرى.', tooBig: 'تعذر تصغير هذه الصورة بما يكفي. جرّب صورة أخرى.', badFile: 'اختر صورة JPG أو PNG أو WebP.', privacy: 'صورتك تظهر لك أنت فقط.', done: 'تم', signIn: 'سجّل الدخول عبر Pi لتحديد صورة.' },
  fr: { change: 'Changer la photo de profil', title: 'Photo de profil', upload: 'Téléverser une photo', remove: 'Supprimer la photo', choose: 'Ou choisissez un avatar', saving: 'Enregistrement…', failed: 'Échec de l’enregistrement. Réessayez.', tooBig: 'Cette photo n’a pas pu être assez réduite. Essayez-en une autre.', badFile: 'Choisissez une photo JPG, PNG ou WebP.', privacy: 'Vous seul voyez votre photo.', done: 'Terminé', signIn: 'Connectez-vous avec Pi pour choisir une photo.' },
  es: { change: 'Cambiar foto de perfil', title: 'Foto de perfil', upload: 'Subir una foto', remove: 'Quitar foto', choose: 'O elige un avatar', saving: 'Guardando…', failed: 'No se pudo guardar. Inténtalo de nuevo.', tooBig: 'No se pudo reducir lo suficiente esta foto. Prueba otra.', badFile: 'Elige una foto JPG, PNG o WebP.', privacy: 'Solo tú ves tu foto.', done: 'Listo', signIn: 'Inicia sesión con Pi para elegir una foto.' },
  pt: { change: 'Alterar foto de perfil', title: 'Foto de perfil', upload: 'Enviar uma foto', remove: 'Remover foto', choose: 'Ou escolha um avatar', saving: 'Salvando…', failed: 'Não foi possível salvar. Tente novamente.', tooBig: 'Não foi possível reduzir esta foto o suficiente. Tente outra.', badFile: 'Escolha uma foto JPG, PNG ou WebP.', privacy: 'Só você vê a sua foto.', done: 'Concluído', signIn: 'Entre com Pi para definir uma foto.' },
  ur: { change: 'پروفائل تصویر تبدیل کریں', title: 'پروفائل تصویر', upload: 'تصویر اپ لوڈ کریں', remove: 'تصویر ہٹائیں', choose: 'یا اوتار منتخب کریں', saving: 'محفوظ ہو رہا ہے…', failed: 'محفوظ نہیں ہو سکا۔ دوبارہ کوشش کریں۔', tooBig: 'یہ تصویر کافی چھوٹی نہیں ہو سکی۔ دوسری آزمائیں۔', badFile: 'JPG، PNG یا WebP تصویر منتخب کریں۔', privacy: 'آپ کی تصویر صرف آپ کو نظر آتی ہے۔', done: 'مکمل', signIn: 'تصویر لگانے کے لیے Pi سے سائن اِن کریں۔' },
  zh: { change: '更换头像', title: '头像', upload: '上传照片', remove: '移除头像', choose: '或选择一个头像', saving: '保存中…', failed: '保存失败，请重试。', tooBig: '这张照片无法压缩到足够小，请换一张。', badFile: '请选择 JPG、PNG 或 WebP 照片。', privacy: '只有你能看到你的头像。', done: '完成', signIn: '请使用 Pi 登录后设置头像。' },
} as const;
