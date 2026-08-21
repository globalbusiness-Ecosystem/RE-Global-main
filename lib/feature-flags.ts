// lib/feature-flags.ts
// مركز التحكم في الميزات المؤجّلة - غيّر القيمة هنا فقط لتفعيل/تعطيل
export const FEATURE_FLAGS = {
  SECONDARY_MARKET: false, // يُفعّل فقط بعد: إثبات طلب حقيقي + مراجعة قانونية + ترخيص
} as const;
