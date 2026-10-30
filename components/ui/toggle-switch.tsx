/** @jsxRuntime automatic */
// A switch whose knob moves the right way in both reading directions. The old one used a plain `translate-x`,
// which is physical: in Arabic (right-to-left) the knob started at the right edge and "on" pushed it out of the pill.
// `rtl:` flips the sign, so the knob always travels inside the track. Also exposed as a real switch to screen readers.
export function toggleKnobClass(checked: boolean, small = false): string {
  const travel = small ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-5 rtl:-translate-x-5';
  return `${small ? 'w-4 h-4' : 'w-6 h-6'} rounded-full bg-white transition transform ${checked ? travel : 'translate-x-0.5 rtl:-translate-x-0.5'}`;
}

export function ToggleSwitch({ checked, onClick, small, label }: { checked: boolean; onClick: () => void; small?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={`${small ? 'w-9 h-5' : 'w-12 h-7'} rounded-full transition flex items-center shrink-0 ${checked ? 'bg-accent' : 'bg-muted'}`}
    >
      <span className={toggleKnobClass(checked, small)} />
    </button>
  );
}
