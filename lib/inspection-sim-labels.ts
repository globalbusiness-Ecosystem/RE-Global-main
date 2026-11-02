import type { NavLanguage } from './nav-i18n';

// Texts of the live inspection simulation (drone, robot, AI, certificate), in all 7 languages.
type Row = Record<NavLanguage, string>;

export const SIM_LABELS = {
  live: { en: 'Live simulation', ar: 'محاكاة حية', fr: 'Simulation en direct', es: 'Simulación en vivo', pt: 'Simulação ao vivo', ur: 'لائیو سمیولیشن', zh: '实时模拟' },
  exterior: { en: 'Drone — exterior scan', ar: 'الدرون — مسح خارجي', fr: 'Drone — scan extérieur', es: 'Dron — escaneo exterior', pt: 'Drone — varredura externa', ur: 'ڈرون — بیرونی اسکین', zh: '无人机 — 外部扫描' },
  interior: { en: 'Robot — interior scan', ar: 'الروبوت — مسح داخلي', fr: 'Robot — scan intérieur', es: 'Robot — escaneo interior', pt: 'Robô — varredura interna', ur: 'روبوٹ — اندرونی اسکین', zh: '机器人 — 内部扫描' },
  analysis: { en: 'Aladdin AI — analyzing', ar: 'علاء الدين — تحليل', fr: 'Aladdin IA — analyse', es: 'Aladdin IA — analizando', pt: 'Aladdin IA — analisando', ur: 'علاء الدین AI — تجزیہ', zh: 'Aladdin AI — 分析中' },
  certify: { en: 'Certifying on-chain', ar: 'توثيق على البلوكتشين', fr: 'Certification sur la blockchain', es: 'Certificando en la blockchain', pt: 'Certificando na blockchain', ur: 'بلاک چین پر تصدیق', zh: '链上认证' },
} satisfies Record<string, Row>;

export type SimLabelKey = keyof typeof SIM_LABELS;

export function sim(key: SimLabelKey, language: string): string {
  const row = SIM_LABELS[key] as Row;
  return row[language as NavLanguage] ?? row.en;
}
