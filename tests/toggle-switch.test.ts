import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToggleSwitch, toggleKnobClass } from '@/components/ui/toggle-switch';

describe('toggleKnobClass', () => {
  it('flips the travel in right-to-left so the knob stays inside the track', () => {
    expect(toggleKnobClass(true)).toContain('translate-x-5');
    expect(toggleKnobClass(true)).toContain('rtl:-translate-x-5');
    expect(toggleKnobClass(false)).toContain('translate-x-0.5');
    expect(toggleKnobClass(false)).toContain('rtl:-translate-x-0.5');
  });
  it('has a smaller travel for the small switch', () => {
    expect(toggleKnobClass(true, true)).toContain('translate-x-4');
    expect(toggleKnobClass(true, true)).toContain('rtl:-translate-x-4');
    expect(toggleKnobClass(true, true)).toContain('w-4 h-4');
  });
});

describe('ToggleSwitch', () => {
  const html = (props: { checked: boolean; small?: boolean; label?: string }) => renderToStaticMarkup(createElement(ToggleSwitch, { onClick: () => {}, ...props }));
  it('is a real switch for screen readers, with its state and name', () => {
    const on = html({ checked: true, label: 'Notifications' });
    expect(on).toContain('role="switch"');
    expect(on).toContain('aria-checked="true"');
    expect(on).toContain('aria-label="Notifications"');
    expect(on).toContain('type="button"');
    expect(html({ checked: false })).toContain('aria-checked="false"');
  });
  it('colours the track by state and sizes it', () => {
    expect(html({ checked: true })).toContain('bg-accent');
    expect(html({ checked: false })).toContain('bg-muted');
    expect(html({ checked: true, small: true })).toContain('w-9 h-5');
    expect(html({ checked: true })).toContain('w-12 h-7');
  });
});
