import type { NavLanguage } from './nav-i18n';

// Texts of the photo capture/upload box inside the Aladdin advisor, in all 7 languages.
type Row = Record<NavLanguage, string>;

export const MEDIA_LABELS = {
  takPhoto: { en: 'Take Photo', ar: 'التقط صورة', fr: 'Prendre une photo', es: 'Tomar foto', pt: 'Tirar foto', ur: 'تصویر لیں', zh: '拍照' },
  selectGallery: { en: 'Select from Gallery', ar: 'اختر من الصور', fr: 'Choisir dans la galerie', es: 'Elegir de la galería', pt: 'Escolher da galeria', ur: 'گیلری سے منتخب کریں', zh: '从相册选择' },
  capture: { en: 'Capture', ar: 'التقط', fr: 'Capturer', es: 'Capturar', pt: 'Capturar', ur: 'کیپچر کریں', zh: '拍摄' },
  cancel: { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler', es: 'Cancelar', pt: 'Cancelar', ur: 'منسوخ کریں', zh: '取消' },
  upload: { en: 'Upload to Aladdin', ar: 'رفع إلى علاء الدين', fr: 'Envoyer à Aladdin', es: 'Subir a Aladdin', pt: 'Enviar para o Aladdin', ur: 'علاء الدین کو بھیجیں', zh: '上传给 Aladdin' },
  remove: { en: 'Remove', ar: 'إزالة', fr: 'Supprimer', es: 'Quitar', pt: 'Remover', ur: 'ہٹائیں', zh: '移除' },
  uploading: { en: 'Uploading...', ar: 'جاري الرفع...', fr: 'Envoi en cours...', es: 'Subiendo...', pt: 'Enviando...', ur: 'اپ لوڈ ہو رہا ہے...', zh: '上传中...' },
  analyzing: { en: 'Analyzing property...', ar: 'جاري تحليل العقار...', fr: 'Analyse du bien en cours...', es: 'Analizando la propiedad...', pt: 'Analisando o imóvel...', ur: 'جائیداد کا تجزیہ ہو رہا ہے...', zh: '正在分析房产...' },
  error: { en: 'Error', ar: 'خطأ', fr: 'Erreur', es: 'Error', pt: 'Erro', ur: 'خرابی', zh: '错误' },
  permissionDenied: { en: 'Camera permission denied', ar: 'تم رفض الوصول للكاميرا', fr: 'Autorisation de la caméra refusée', es: 'Permiso de cámara denegado', pt: 'Permissão da câmera negada', ur: 'کیمرے کی اجازت مسترد', zh: '相机权限被拒绝' },
  noCamera: { en: 'No camera found', ar: 'لا توجد كاميرا متاحة', fr: 'Aucune caméra trouvée', es: 'No se encontró ninguna cámara', pt: 'Nenhuma câmera encontrada', ur: 'کوئی کیمرہ نہیں ملا', zh: '未找到相机' },
} satisfies Record<string, Row>;

export type MediaLabelKey = keyof typeof MEDIA_LABELS;

/** All texts of the box in one language, falling back to English. */
export function mediaLabels(language: string): Record<MediaLabelKey, string> {
  const out = {} as Record<MediaLabelKey, string>;
  for (const key of Object.keys(MEDIA_LABELS) as MediaLabelKey[]) {
    const row = MEDIA_LABELS[key] as Row;
    out[key] = row[language as NavLanguage] ?? row.en;
  }
  return out;
}
