"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import { OfflineBanner } from "./offline-banner";
import { ErrorReporter } from "./error-reporter";
import { SkipLink } from "./skip-link";
import { A11yEnhancer } from "./a11y-enhancer";
import { TermsConsentModal } from "./terms-consent-modal";
import { Toaster } from "sonner";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getStoredTheme, applyTheme } from "@/lib/theme";

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = usePiAuth();
  const { showBanner, setShowBanner } = useOnlineStatus();

  useServiceWorker();

  const [toastTheme, setToastTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    applyTheme(getStoredTheme());
    const sync = () => setToastTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    sync();
    // The header and Settings switch the theme by toggling the class on <html>; the toasts follow it.
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <SkipLink />
      <A11yEnhancer />
      <ErrorReporter />
      <OfflineBanner isVisible={showBanner} onClose={() => setShowBanner(false)} />
      {isInitialized && <TermsConsentModal />}
      <main id="main-content" tabIndex={-1} className="outline-none">{children}</main>
      <Toaster
        position="top-center"
        theme={toastTheme}
        richColors
        expand
        style={{
          '--colors-error-bg': 'oklch(0.68 0.16 70)',
          '--colors-error-text': 'oklch(0.1 0 0)',
          '--colors-error-border': 'oklch(0.68 0.16 70)',
        } as React.CSSProperties}
      />
    </>
  );
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <LanguageProvider>
        <AppContent>{children}</AppContent>
      </LanguageProvider>
    </PiAuthProvider>
  );
}
