'use client';

import { useState, useCallback } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    if (value && index < length - 1) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }

    if (newValues.every(v => v !== '')) {
      onComplete?.(newValues.join(''));
    }
  }, [values, length, onComplete]);

  return (
    <div className="flex gap-2 justify-center">
      {Array(length)
        .fill(0)
        .map((_, i) => (
          <input
            key={i}
            data-index={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[i]}
            onChange={e => handleChange(i, e.target.value)}
            disabled={disabled}
            className="w-12 h-12 text-center text-xl font-bold border-2 border-amber-500/30
              rounded-lg bg-slate-900 text-white focus:border-amber-500 focus:ring-2
              focus:ring-amber-500/20 transition-all disabled:opacity-50"
          />
        ))}
    </div>
  );
}

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  strength?: number;
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder = 'كلمة المرور',
  error,
  strength,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthColor = (strength: number) => {
    if (strength < 33) return 'bg-red-500';
    if (strength < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-white">{label}</label>}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field w-full pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {strength !== undefined && (
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < Math.ceil((strength / 100) * 3) ? getStrengthColor(strength) : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
    </div>
  );
}

interface TwoFactorSetupProps {
  onSetup?: (method: '2fa' | 'biometric') => void;
  onSkip?: () => void;
}

export function TwoFactorSetup({ onSetup, onSkip }: TwoFactorSetupProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">تفعيل المصادقة الثنائية</h3>
      <p className="text-sm text-gray-400">حماية حسابك باستخدام طريقة إضافية للتحقق</p>
      
      <div className="space-y-3">
        <button
          onClick={() => onSetup?.('2fa')}
          className="w-full button-primary flex items-center justify-between"
        >
          <span>تطبيق المصادقة</span>
          <Lock className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onSetup?.('biometric')}
          className="w-full button-outline flex items-center justify-between"
        >
          <span>بصمة أو وجه</span>
          <CheckCircle className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={onSkip}
        className="w-full py-2 text-gray-400 hover:text-white transition-colors"
      >
        تخطي الآن
      </button>
    </div>
  );
}

interface UserProfileSetupProps {
  onComplete?: (profile: UserProfile) => void;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

export function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (profile.firstName && profile.lastName && profile.email && profile.phone) {
      onComplete?.(profile);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">ملفك الشخصي</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="الاسم الأول"
          value={profile.firstName}
          onChange={e => handleChange('firstName', e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="الاسم الأخير"
          value={profile.lastName}
          onChange={e => handleChange('lastName', e.target.value)}
          className="input-field"
        />
      </div>

      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={profile.email}
        onChange={e => handleChange('email', e.target.value)}
        className="input-field w-full"
      />

      <input
        type="tel"
        placeholder="رقم الهاتف"
        value={profile.phone}
        onChange={e => handleChange('phone', e.target.value)}
        className="input-field w-full"
      />

      <button
        onClick={handleSubmit}
        disabled={!profile.firstName || !profile.lastName || !profile.email || !profile.phone}
        className="w-full button-primary disabled:opacity-50"
      >
        إكمال الإعداد
      </button>
    </div>
  );
}

interface AdminPINInputProps {
  onSubmit?: (pin: string) => void;
  maxAttempts?: number;
}

export function AdminPINInput({ onSubmit, maxAttempts = 3 }: AdminPINInputProps) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (pin.length === 4) {
      if (attempts < maxAttempts) {
        onSubmit?.(pin);
      } else {
        setError('تم تجاوز عدد المحاولات المسموحة');
      }
    }
    setAttempts(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">إدخال رمز الإدارة</h3>
      <p className="text-sm text-gray-400">أدخل رمز PIN المكون من 4 أرقام</p>
      
      <OTPInput
        length={4}
        onComplete={pin => {
          setPin(pin);
          handleSubmit();
        }}
      />

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500">
        المحاولات المتبقية: {maxAttempts - attempts}
      </p>
    </div>
  );
}
