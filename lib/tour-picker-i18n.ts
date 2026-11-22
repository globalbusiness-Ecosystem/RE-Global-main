import type { NavLanguage } from './nav-i18n';

type T = { title: string; sample: string; sampleNote: string; empty: string; close: string; open: string };
export const TOUR_PICKER_I18N: Record<NavLanguage, T> = {
  en: { title: '360° virtual tours', sample: 'Sample tour', sampleNote: 'A demo apartment', empty: 'No tours are available yet.', close: 'Close', open: 'Open tour' },
  ar: { title: 'جولات افتراضية 360°', sample: 'جولة تجريبية', sampleNote: 'شقة نموذجية', empty: 'مفيش جولات متاحة لسه.', close: 'إغلاق', open: 'افتح الجولة' },
  fr: { title: 'Visites virtuelles 360°', sample: 'Visite exemple', sampleNote: 'Un appartement de démonstration', empty: 'Aucune visite disponible pour le moment.', close: 'Fermer', open: 'Ouvrir la visite' },
  es: { title: 'Recorridos virtuales 360°', sample: 'Recorrido de ejemplo', sampleNote: 'Un apartamento de demostración', empty: 'Aún no hay recorridos disponibles.', close: 'Cerrar', open: 'Abrir recorrido' },
  pt: { title: 'Tours virtuais 360°', sample: 'Tour de exemplo', sampleNote: 'Um apartamento de demonstração', empty: 'Ainda não há tours disponíveis.', close: 'Fechar', open: 'Abrir tour' },
  ur: { title: '360° ورچوئل ٹورز', sample: 'نمونہ ٹور', sampleNote: 'ایک نمونہ اپارٹمنٹ', empty: 'ابھی کوئی ٹور دستیاب نہیں۔', close: 'بند کریں', open: 'ٹور کھولیں' },
  zh: { title: '360°虚拟游览', sample: '示例游览', sampleNote: '演示公寓', empty: '暂无可用游览。', close: '关闭', open: '打开游览' },
};
