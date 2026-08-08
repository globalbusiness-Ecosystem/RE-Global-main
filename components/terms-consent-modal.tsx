'use client';

import { useEffect, useState } from 'react';
import { FileText, ScrollText } from 'lucide-react';

const CONSENT_KEY = 're_terms_privacy_accepted_v1';

export function TermsConsentModal() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(CONSENT_KEY);
      if (!accepted) {
        setVisible(true);
      }
    } catch (e) {
      console.error('[Consent] localStorage read failed:', e);
    }
  }, []);

  const handleAccept = () => {
    if (!checked) return;
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    } catch (e) {
      console.error('[Consent] localStorage write failed:', e);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[100] p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-accent">Before you continue</h2>
          <p className="text-sm text-muted-foreground">
            Please review our Privacy Policy and Terms of Service before using RE.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-accent underline"
          >
            <FileText className="w-4 h-4" />
            Privacy Policy
          </a>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-accent underline"
          >
            <ScrollText className="w-4 h-4" />
            Terms of Service
          </a>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-foreground/90 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-accent shrink-0"
          />
          <span>I have read and agree to the Privacy Policy and Terms of Service.</span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!checked}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            checked
              ? 'bg-accent hover:bg-accent/90 text-accent-foreground cursor-pointer'
              : 'bg-accent/30 text-accent-foreground/50 cursor-not-allowed'
          }`}
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );
}
