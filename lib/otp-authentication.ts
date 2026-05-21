// OTP 2FA Authentication System for RE Platform

import { toast } from 'sonner';

export interface OTPVerification {
  phoneNumber: string;
  otp: string;
  attempts: number;
  expiresAt: Date;
  verified: boolean;
}

export interface AuthSession {
  userId: string;
  phoneNumber: string;
  verified: boolean;
  createdAt: Date;
  expiresAt: Date;
  token?: string;
}

class OTPAuthenticationManager {
  private verifications: Map<string, OTPVerification> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly SESSION_EXPIRY_HOURS = 24;

  // Generate OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to phone number (simulated)
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      console.log('[OTP] Sending OTP to', phoneNumber);

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        throw new Error('Invalid phone number format');
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

      // Store OTP verification
      this.verifications.set(formattedPhone, {
        phoneNumber: formattedPhone,
        otp,
        attempts: 0,
        expiresAt,
        verified: false,
      });

      console.log('[OTP] OTP generated:', otp, 'Expires:', expiresAt);

      // In production, send via Twilio or similar
      // await this.sendViaSMS(formattedPhone, `Your RE Platform OTP is: ${otp}`);

      toast.success(`OTP sent to ${formattedPhone}`);
      return true;
    } catch (error) {
      console.error('[OTP] Send error:', error);
      toast.error('Failed to send OTP');
      return false;
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, otp: string): Promise<AuthSession | null> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        throw new Error('Invalid phone number');
      }

      const verification = this.verifications.get(formattedPhone);
      if (!verification) {
        throw new Error('No OTP found for this phone number');
      }

      // Check expiry
      if (new Date() > verification.expiresAt) {
        this.verifications.delete(formattedPhone);
        throw new Error('OTP expired');
      }

      // Check attempts
      if (verification.attempts >= this.MAX_ATTEMPTS) {
        this.verifications.delete(formattedPhone);
        throw new Error('Too many failed attempts');
      }

      // Verify OTP
      if (verification.otp !== otp) {
        verification.attempts++;
        throw new Error(`Invalid OTP. Attempts remaining: ${this.MAX_ATTEMPTS - verification.attempts}`);
      }

      // Mark as verified
      verification.verified = true;

      // Create session
      const userId = `user_${Date.now()}`;
      const expiresAt = new Date(Date.now() + this.SESSION_EXPIRY_HOURS * 3600000);
      const token = this.generateSessionToken(userId, formattedPhone);

      const session: AuthSession = {
        userId,
        phoneNumber: formattedPhone,
        verified: true,
        createdAt: new Date(),
        expiresAt,
        token,
      };

      this.sessions.set(userId, session);
      this.verifications.delete(formattedPhone);

      console.log('[OTP] Verification successful:', userId);
      toast.success('Authenticated successfully');
      return session;
    } catch (error) {
      console.error('[OTP] Verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Verification failed');
      return null;
    }
  }

  // Format phone number
  private formatPhoneNumber(phone: string): string | null {
    try {
      // Remove non-numeric characters except +
      const cleaned = phone.replace(/[^\d+]/g, '');

      // Validate
      if (cleaned.length < 10) return null;

      // Ensure starts with +
      return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    } catch {
      return null;
    }
  }

  // Generate session token
  private generateSessionToken(userId: string, phone: string): string {
    const payload = `${userId}:${phone}:${Date.now()}`;
    return Buffer.from(payload).toString('base64');
  }

  // Validate session
  validateSession(token: string): AuthSession | null {
    try {
      for (const [, session] of this.sessions) {
        if (session.token === token) {
          if (new Date() > session.expiresAt) {
            this.sessions.delete(session.userId);
            return null;
          }
          return session;
        }
      }
      return null;
    } catch (error) {
      console.error('[OTP] Session validation error:', error);
      return null;
    }
  }

  // Get session
  getSession(userId: string): AuthSession | null {
    const session = this.sessions.get(userId);
    if (session && new Date() > session.expiresAt) {
      this.sessions.delete(userId);
      return null;
    }
    return session || null;
  }

  // Logout
  logout(userId: string): void {
    this.sessions.delete(userId);
    console.log('[OTP] User logged out:', userId);
    toast.success('Logged out successfully');
  }

  // Check if authenticated
  isAuthenticated(userId: string): boolean {
    return this.getSession(userId) !== null;
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!formattedPhone) return false;

    this.verifications.delete(formattedPhone);
    return this.sendOTP(phoneNumber);
  }

  // Clear all verifications (for testing)
  clearVerifications(): void {
    this.verifications.clear();
    console.log('[OTP] All verifications cleared');
  }

  // Get verification status
  getVerificationStatus(phoneNumber: string): OTPVerification | null {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!formattedPhone) return null;
    return this.verifications.get(formattedPhone) || null;
  }
}

// Export singleton
export const otpManager = new OTPAuthenticationManager();

// Hook for React
export function useOTPAuthentication() {
  return {
    sendOTP: (phone: string) => otpManager.sendOTP(phone),
    verifyOTP: (phone: string, otp: string) => otpManager.verifyOTP(phone, otp),
    validateSession: (token: string) => otpManager.validateSession(token),
    getSession: (userId: string) => otpManager.getSession(userId),
    logout: (userId: string) => otpManager.logout(userId),
    isAuthenticated: (userId: string) => otpManager.isAuthenticated(userId),
    resendOTP: (phone: string) => otpManager.resendOTP(phone),
  };
}
