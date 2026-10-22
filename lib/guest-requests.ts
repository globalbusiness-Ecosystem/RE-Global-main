import type { NavLanguage } from './nav-i18n';

// A special request the guest adds to their own booking (late check-in, baby cot, ...). Pure rules: no Firebase.
// It is plain text, at most 300 characters, and can be changed until the stay is over. An empty text clears it.

export const REQUEST_MAX = 300;

export type RequestCheck = { ok: true; note: string } | { ok: false; error: string };

export function cleanRequest(raw: unknown): RequestCheck {
  if (raw === undefined || raw === null) return { ok: true, note: '' };
  if (typeof raw !== 'string') return { ok: false, error: 'Invalid request text' };
  return { ok: true, note: raw.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/ {2,}/g, ' ').trim().slice(0, REQUEST_MAX) };
}

// Only confirmed stays that are not over yet (dates are YYYY-MM-DD, compared as text).
export const canEditRequest = (b: { status: unknown; end: string }, today: string) => b.status === 'confirmed' && b.end > today;

export interface RequestStrings { label: string; placeholder: string; save: string; saving: string; saved: string; edit: string; add: string; error: string }
export const REQUEST_I18N: Record<NavLanguage, RequestStrings> = {
  en: { label: 'Special request', placeholder: 'e.g. late check-in, baby cot (optional)', save: 'Save request', saving: 'Saving...', saved: 'Saved. The host will see your request.', edit: 'Edit request', add: 'Add a special request', error: 'Could not save. Please try again.' },
  ar: { label: 'طلب خاص', placeholder: 'مثلاً: وصول متأخر، سرير أطفال (اختياري)', save: 'احفظ الطلب', saving: 'جاري الحفظ...', saved: 'اتحفظ. صاحب المكان هيشوف طلبك.', edit: 'عدّل الطلب', add: 'ضيف طلب خاص', error: 'ماقدرناش نحفظ. جرّب تاني.' },
  fr: { label: 'Demande spéciale', placeholder: 'ex. arrivée tardive, lit bébé (facultatif)', save: 'Enregistrer la demande', saving: 'Enregistrement...', saved: 'Enregistré. L’hôte verra votre demande.', edit: 'Modifier la demande', add: 'Ajouter une demande spéciale', error: 'Enregistrement impossible. Réessayez.' },
  es: { label: 'Petición especial', placeholder: 'p. ej. llegada tardía, cuna (opcional)', save: 'Guardar petición', saving: 'Guardando...', saved: 'Guardado. El anfitrión verá tu petición.', edit: 'Editar petición', add: 'Añadir una petición especial', error: 'No se pudo guardar. Inténtalo de nuevo.' },
  pt: { label: 'Pedido especial', placeholder: 'ex.: check-in tardio, berço (opcional)', save: 'Salvar pedido', saving: 'Salvando...', saved: 'Salvo. O anfitrião verá o seu pedido.', edit: 'Editar pedido', add: 'Adicionar um pedido especial', error: 'Não foi possível salvar. Tente novamente.' },
  ur: { label: 'خصوصی درخواست', placeholder: 'مثلاً: دیر سے آمد، بچوں کا پلنگ (اختیاری)', save: 'درخواست محفوظ کریں', saving: 'محفوظ ہو رہی ہے...', saved: 'محفوظ ہو گئی۔ میزبان آپ کی درخواست دیکھے گا۔', edit: 'درخواست میں ترمیم کریں', add: 'خصوصی درخواست شامل کریں', error: 'محفوظ نہیں ہو سکی۔ دوبارہ کوشش کریں۔' },
  zh: { label: '特殊要求', placeholder: '例如：晚到、婴儿床（可选）', save: '保存要求', saving: '保存中...', saved: '已保存，房东会看到您的要求。', edit: '修改要求', add: '添加特殊要求', error: '无法保存，请重试。' },
};
export const requestStrings = (lang: string): RequestStrings => REQUEST_I18N[lang as NavLanguage] ?? REQUEST_I18N.en;
