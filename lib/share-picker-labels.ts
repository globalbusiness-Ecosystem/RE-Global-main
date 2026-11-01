import type { NavLanguage } from './nav-i18n';

// Texts of the share-count picker on the invest page, in all 7 languages. {left} and {total} are filled in by sp().
type Row = Record<NavLanguage, string>;

export const SHARE_PICKER_LABELS = {
  needInt: { en: 'Enter a whole number of shares', ar: 'اكتب عدد حصص صحيح', fr: 'Saisissez un nombre entier de parts', es: 'Introduce un número entero de participaciones', pt: 'Digite um número inteiro de cotas', ur: 'حصص کی پوری تعداد درج کریں', zh: '请输入整数份额' },
  onlyLeft: { en: 'Only {left} shares left', ar: 'المتاح {left} حصة بس', fr: 'Il ne reste que {left} parts', es: 'Solo quedan {left} participaciones', pt: 'Restam apenas {left} cotas', ur: 'صرف {left} حصص باقی ہیں', zh: '仅剩 {left} 份' },
  noPrice: { en: 'Price unavailable', ar: 'السعر مش متاح', fr: 'Prix indisponible', es: 'Precio no disponible', pt: 'Preço indisponível', ur: 'قیمت دستیاب نہیں', zh: '价格不可用' },
  soldOut: { en: 'Fully subscribed', ar: 'الحصص كلها اتباعت', fr: 'Entièrement souscrit', es: 'Totalmente suscrito', pt: 'Totalmente subscrito', ur: 'تمام حصص فروخت ہو چکے', zh: '已全部认购' },
  numShares: { en: 'Number of shares', ar: 'عدد الحصص', fr: 'Nombre de parts', es: 'Número de participaciones', pt: 'Número de cotas', ur: 'حصص کی تعداد', zh: '份额数量' },
  available: { en: '{left} of {total} shares available', ar: 'المتاح {left} من {total} حصة', fr: '{left} parts disponibles sur {total}', es: '{left} de {total} participaciones disponibles', pt: '{left} de {total} cotas disponíveis', ur: '{total} میں سے {left} حصص دستیاب', zh: '共 {total} 份，剩余 {left} 份' },
  sharesWord: { en: 'shares', ar: 'حصة', fr: 'parts', es: 'participaciones', pt: 'cotas', ur: 'حصص', zh: '份' },
} satisfies Record<string, Row>;

export type SharePickerKey = keyof typeof SHARE_PICKER_LABELS;

export function sp(key: SharePickerKey, language: string, vars: Record<string, number> = {}): string {
  const row = SHARE_PICKER_LABELS[key] as Row;
  let text = row[language as NavLanguage] ?? row.en;
  for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
  return text;
}
