import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { requiredKinds, hasAllPhotos, fitSize, isDocType, isFileKind } from '@/lib/kyc-files';

const src = (p: string) => readFileSync(p, 'utf8');

describe('kyc photos', () => {
  it('ID needs front, back and selfie; passport needs page and selfie', () => {
    expect(requiredKinds('id')).toEqual(['front', 'back', 'selfie']);
    expect(requiredKinds('passport')).toEqual(['front', 'selfie']);
    expect(hasAllPhotos('id', ['front', 'selfie'])).toBe(false);
    expect(hasAllPhotos('passport', ['front', 'selfie'])).toBe(true);
  });
  it('validates doc types and kinds', () => {
    expect(isDocType('id')).toBe(true);
    expect(isDocType('x')).toBe(false);
    expect(isFileKind('selfie')).toBe(true);
    expect(isFileKind('../x')).toBe(false);
  });
  it('fitSize never enlarges and keeps ratio', () => {
    expect(fitSize(800, 600, 1600)).toEqual({ w: 800, h: 600 });
    const r = fitSize(4000, 2000, 1600);
    expect(r.w).toBe(1600);
    expect(r.h).toBe(800);
  });
  it('wiring: request needs photos, admin view is logged, header hides when approved', () => {
    expect(src('app/api/kyc/request/route.ts')).toContain('photos_missing');
    expect(src('app/api/admin/kyc/file/route.ts')).toContain('kyc.view-file');
    expect(src('app/api/admin/kyc/file/route.ts')).toContain('no-store');
    expect(src('components/header.tsx')).toContain("kycStatus !== 'approved'");
    expect(src('lib/kyc-decision.ts')).toContain('deleteKycFiles');
  });
});
