import type { NavLanguage } from './nav-i18n';

// Texts of the QR scanner and of the partners page, in all 7 languages.
type Row = Record<NavLanguage, string>;

export const SCANNER_LABELS = {
  noQr: { en: 'No QR code found in this image', ar: 'لم يتم العثور على QR في هذه الصورة', fr: 'Aucun code QR trouvé dans cette image', es: 'No se encontró ningún código QR en esta imagen', pt: 'Nenhum código QR encontrado nesta imagem', ur: 'اس تصویر میں کوئی QR کوڈ نہیں ملا', zh: '此图片中未找到二维码' },
  noCamera: { en: 'Could not access the camera. Please grant permission.', ar: 'تعذر الوصول للكاميرا. تأكد من إعطاء الإذن.', fr: 'Impossible d\'accéder à la caméra. Veuillez accorder l\'autorisation.', es: 'No se pudo acceder a la cámara. Concede el permiso.', pt: 'Não foi possível acessar a câmera. Conceda a permissão.', ur: 'کیمرے تک رسائی نہیں ہو سکی۔ براہِ کرم اجازت دیں۔', zh: '无法访问相机，请授予权限。' },
  pointCamera: { en: 'Point the camera at the QR code', ar: 'وجّه الكاميرا نحو الـ QR', fr: 'Dirigez la caméra vers le code QR', es: 'Apunta la cámara al código QR', pt: 'Aponte a câmera para o código QR', ur: 'کیمرہ QR کوڈ کی طرف کریں', zh: '请将相机对准二维码' },
  uploadImage: { en: 'Upload image', ar: 'رفع صورة', fr: 'Importer une image', es: 'Subir imagen', pt: 'Enviar imagem', ur: 'تصویر اپ لوڈ کریں', zh: '上传图片' },
  contact: { en: 'Contact', ar: 'اتصل', fr: 'Contacter', es: 'Contactar', pt: 'Contatar', ur: 'رابطہ کریں', zh: '联系' },
  visit: { en: 'Visit', ar: 'زيارة', fr: 'Visiter', es: 'Visitar', pt: 'Visitar', ur: 'ملاحظہ کریں', zh: '访问' },
} satisfies Record<string, Row>;

export type ScannerLabelKey = keyof typeof SCANNER_LABELS;

export function qs(key: ScannerLabelKey, language: string): string {
  const row = SCANNER_LABELS[key] as Row;
  return row[language as NavLanguage] ?? row.en;
}
