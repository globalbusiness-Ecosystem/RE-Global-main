import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement as h } from 'react';
import { PROFILE_STEPS_I18N, profilePercent, profileSteps } from '@/lib/profile-steps';
import { ProfileChecklist } from '@/components/profile-checklist';

const none = { hasPicture: false, piVerified: false, emailVerified: false, invitedSomeone: false };

describe('profile steps', () => {
  it('counts nothing done as 0 and everything as 100', () => {
    expect(profilePercent(profileSteps(none))).toBe(0);
    expect(profilePercent(profileSteps({ hasPicture: true, piVerified: true, emailVerified: true, invitedSomeone: true }))).toBe(100);
  });
  it('does not count the email as verified without a Pi sign-in', () => {
    const steps = profileSteps({ ...none, emailVerified: true });
    expect(steps.find((s) => s.id === 'email')?.done).toBe(false);
  });
  it('rounds partial progress', () => {
    expect(profilePercent(profileSteps({ ...none, piVerified: true }))).toBe(25);
    expect(profilePercent(profileSteps({ ...none, piVerified: true, hasPicture: true, invitedSomeone: true }))).toBe(75);
    expect(profilePercent([])).toBe(0);
  });
  it('has the same keys in all 7 languages', () => {
    const keys = Object.keys(PROFILE_STEPS_I18N.en).sort();
    for (const l of Object.values(PROFILE_STEPS_I18N)) expect(Object.keys(l).sort()).toEqual(keys);
    expect(Object.keys(PROFILE_STEPS_I18N)).toHaveLength(7);
  });
  it('renders the list while incomplete and a short note when complete', () => {
    const part = renderToStaticMarkup(h(ProfileChecklist, { steps: profileSteps({ ...none, piVerified: true }), language: 'ar' }));
    expect(part).toContain('25%');
    expect(part).toContain('أضف صورة للملف الشخصي');
    const full = renderToStaticMarkup(h(ProfileChecklist, { steps: profileSteps({ hasPicture: true, piVerified: true, emailVerified: true, invitedSomeone: true }), language: 'en' }));
    expect(full).toContain('Your profile is complete');
    expect(full).not.toContain('<ul');
  });
});
