'use client';

import { useState, useCallback } from 'react';

interface OTPConfig {
  length: number;
  expiryTime: number;
  maxAttempts: number;
}

interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  phoneNumber?: string;
  role?: 'user' | 'admin' | 'agent';
  twoFactorEnabled?: boolean;
}

const defaultConfig: OTPConfig = {
  length: 6,
  expiryTime: 5 * 60 * 1000,
  maxAttempts: 3,
};

export class AuthenticationManager {
  private otpStore: Map<string, { code: string; expiry: number; attempts: number }> = new Map();
  private sessions: Map<string, AuthState> = new Map();
  private config: OTPConfig;

  constructor(config?: Partial<OTPConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  generateOTP(identifier: string): string {
    const code = Math.random().toString().slice(2, 2 + this.config.length);
    const expiry = Date.now() + this.config.expiryTime;
    this.otpStore.set(identifier, { code, expiry, attempts: 0 });
    return code;
  }

  verifyOTP(identifier: string, code: string): boolean {
    const stored = this.otpStore.get(identifier);
    if (!stored) return false;

    if (Date.now() > stored.expiry) {
      this.otpStore.delete(identifier);
      return false;
    }

    if (stored.attempts >= this.config.maxAttempts) {
      this.otpStore.delete(identifier);
      return false;
    }

    stored.attempts++;

    if (stored.code === code) {
      this.otpStore.delete(identifier);
      return true;
    }

    return false;
  }

  createSession(userId: string, email: string, role: 'user' | 'admin' | 'agent' = 'user'): string {
    const sessionId = Math.random().toString(36).slice(2);
    const authState: AuthState = {
      isAuthenticated: true,
      userId,
      email,
      role,
      twoFactorEnabled: false,
    };
    this.sessions.set(sessionId, authState);
    return sessionId;
  }

  validateSession(sessionId: string): AuthState | null {
    return this.sessions.get(sessionId) || null;
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  enableTwoFactor(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.twoFactorEnabled = true;
      return true;
    }
    return false;
  }

  verifyAdminPin(pin: string, correctPin: string): boolean {
    return pin === correctPin;
  }
}

export function useOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const manager = new AuthenticationManager();

  const sendOTP = useCallback(async (identifier: string) => {
    setLoading(true);
    setError('');
    try {
      const code = manager.generateOTP(identifier);
      console.log(`[v0] OTP generated: ${code}`);
      setOtp(code);
      return code;
    } catch (err) {
      setError('فشل في إرسال OTP');
    } finally {
      setLoading(false);
    }
  }, [manager]);

  const verifyOTP = useCallback((identifier: string, code: string) => {
    try {
      return manager.verifyOTP(identifier, code);
    } catch (err) {
      setError('فشل في التحقق من OTP');
      return false;
    }
  }, [manager]);

  return { otp, loading, error, sendOTP, verifyOTP };
}

export function useUserSession() {
  const [session, setSession] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);
  const manager = new AuthenticationManager();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const userId = Math.random().toString(36).slice(7);
      const sessionId = manager.createSession(userId, email, 'user');
      const authState = manager.validateSession(sessionId);
      setSession(authState);
      localStorage.setItem('sessionId', sessionId);
      return true;
    } catch (err) {
      console.error('[v0] Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [manager]);

  const logout = useCallback(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      manager.destroySession(sessionId);
      localStorage.removeItem('sessionId');
    }
    setSession(null);
  }, [manager]);

  return { session, loading, login, logout };
}
