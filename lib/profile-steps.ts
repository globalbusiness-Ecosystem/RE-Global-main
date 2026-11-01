// "Complete your profile" checklist: pure, so the numbers can be tested.

export type ProfileStepId = 'picture' | 'pi' | 'email' | 'invite';

export interface ProfileFacts { hasPicture: boolean; piVerified: boolean; emailVerified: boolean; invitedSomeone: boolean }
export interface ProfileStep { id: ProfileStepId; done: boolean }

export function profileSteps(f: ProfileFacts): ProfileStep[] {
  return [
    { id: 'pi', done: f.piVerified },
    { id: 'email', done: f.piVerified && f.emailVerified },
    { id: 'picture', done: f.hasPicture },
    { id: 'invite', done: f.invitedSomeone },
  ];
}

export function profilePercent(steps: ProfileStep[]): number {
  if (steps.length === 0) return 0;
  return Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
}

export const PROFILE_STEPS_I18N = {
  en: { title: 'Complete your profile', pi: 'Sign in with Pi', email: 'Verify your email', picture: 'Add a profile picture', invite: 'Invite a friend', complete: 'Your profile is complete' },
  ar: { title: 'اكتمال ملفك الشخصي', pi: 'سجّل الدخول عبر Pi', email: 'وثّق بريدك الإلكتروني', picture: 'أضف صورة للملف الشخصي', invite: 'ادعُ صديقاً', complete: 'ملفك الشخصي مكتمل' },
  fr: { title: 'Complétez votre profil', pi: 'Connectez-vous avec Pi', email: 'Vérifiez votre e-mail', picture: 'Ajoutez une photo de profil', invite: 'Invitez un ami', complete: 'Votre profil est complet' },
  es: { title: 'Completa tu perfil', pi: 'Inicia sesión con Pi', email: 'Verifica tu correo', picture: 'Añade una foto de perfil', invite: 'Invita a un amigo', complete: 'Tu perfil está completo' },
  pt: { title: 'Complete seu perfil', pi: 'Entre com Pi', email: 'Verifique seu e-mail', picture: 'Adicione uma foto de perfil', invite: 'Convide um amigo', complete: 'Seu perfil está completo' },
  ur: { title: 'اپنا پروفائل مکمل کریں', pi: 'Pi سے سائن اِن کریں', email: 'اپنا ای میل تصدیق کریں', picture: 'پروفائل تصویر شامل کریں', invite: 'کسی دوست کو مدعو کریں', complete: 'آپ کا پروفائل مکمل ہے' },
  zh: { title: '完善你的资料', pi: '使用 Pi 登录', email: '验证邮箱', picture: '添加头像', invite: '邀请朋友', complete: '你的资料已完善' },
} as const;
