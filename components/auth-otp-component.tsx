'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOTPAuthentication } from '@/lib/otp-authentication';
import { Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OTPAuthProps {
  language?: 'en' | 'ar';
  onSuccess?: (session: any) => void;
  onCancel?: () => void;
}

export function OTPAuthComponent({ language = 'en', onSuccess, onCancel }: OTPAuthProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { sendOTP, verifyOTP, resendOTP } = useOTPAuthentication();

  const isArabic = language === 'ar';

  const texts = {
    en: {
      title: 'Two-Factor Authentication',
      description: 'Enter your phone number to receive OTP',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '+201010810558',
      nextButton: 'Send OTP',
      otpLabel: 'Verification Code',
      otpPlaceholder: '000000',
      verifyButton: 'Verify',
      resendButton: 'Resend OTP',
      cancelButton: 'Cancel',
      enterOTP: 'Please enter 6-digit OTP sent to your phone',
      invalidPhone: 'Please enter a valid phone number',
      verificationSent: 'Verification code sent successfully',
      verificationFailed: 'Verification failed',
      phoneNumberRequired: 'Phone number is required',
      otpRequired: 'OTP is required',
    },
    ar: {
      title: 'المصادقة ثنائية',
      description: 'أدخل رقم هاتفك لتلقي رمز OTP',
      phoneLabel: 'رقم الهاتف',
      phonePlaceholder: '+201010810558',
      nextButton: 'إرسال الرمز',
      otpLabel: 'كود التحقق',
      otpPlaceholder: '000000',
      verifyButton: 'تحقق',
      resendButton: 'إعادة إرسال',
      cancelButton: 'إلغاء',
      enterOTP: 'الرجاء إدخال رمز التحقق من 6 أرقام',
      invalidPhone: 'الرجاء إدخال رقم هاتف صحيح',
      verificationSent: 'تم إرسال رمز التحقق بنجاح',
      verificationFailed: 'فشل التحقق',
      phoneNumberRequired: 'رقم الهاتف مطلوب',
      otpRequired: 'رمز التحقق مطلوب',
    },
  };

  const t = isArabic ? texts.ar : texts.en;

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast.error(t.phoneNumberRequired);
      return;
    }

    setLoading(true);
    const success = await sendOTP(phoneNumber);
    setLoading(false);

    if (success) {
      setStep('otp');
      setResendTimer(30);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error(t.otpRequired);
      return;
    }

    setLoading(true);
    const session = await verifyOTP(phoneNumber, otp);
    setLoading(false);

    if (session) {
      onSuccess?.(session);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    await resendOTP(phoneNumber);
    setLoading(false);
    setResendTimer(30);
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-background p-4 ${isArabic ? 'rtl' : 'ltr'}`}>
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <Lock className="w-8 h-8 mx-auto mb-2 text-accent" />
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.phoneLabel}</label>
                <div className="relative flex">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendOTP}
                  disabled={loading || !phoneNumber.trim()}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {loading ? 'جاري...' : t.nextButton}
                </Button>
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    {t.cancelButton}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent/10 p-3 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{t.enterOTP}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.otpLabel}</label>
                <Input
                  type="text"
                  placeholder={t.otpPlaceholder}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {loading ? 'جاري التحقق...' : t.verifyButton}
              </Button>

              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resendTimer > 0 || loading}
                className="w-full text-sm"
              >
                {resendTimer > 0 ? `${t.resendButton} (${resendTimer}s)` : t.resendButton}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setResendTimer(0);
                }}
                disabled={loading}
                className="w-full"
              >
                {t.cancelButton}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
