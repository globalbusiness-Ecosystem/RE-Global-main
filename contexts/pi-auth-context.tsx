"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import type {
  Product,
  SDKLiteInstance,
  UserPurchaseBalance,
} from "@/lib/sdklite-types";

export interface PiUser {
  uid: string;
  username: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label?: string; // reverse-geocoded city/area, filled in async
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  isPiVerified: boolean;
  isInitialized: boolean;
  authMessage: string;
  hasError: boolean;
  sdk: SDKLiteInstance | null;
  products: Product[] | null;
  restoredPurchases: UserPurchaseBalance[] | null;
  username: string | null;
  accessToken: string | null;
  user: PiUser | null;
  location: UserLocation | null;
  locationError: string | null;
  requestLocation: () => void;
  reinitialize: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.Pi !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      reject(new Error("SDK URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("Pi SDK script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load Pi SDK script");
      reject(new Error("Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });
};

const loadSDKLite = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.SDKLite !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_LITE_URL) {
      reject(new Error("SDKLite URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_LITE_URL;
    script.async = true;

    script.onload = () => {
      console.log("SDKLite script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load SDKLite script");
      reject(new Error("Failed to load SDKLite script"));
    };

    document.head.appendChild(script);
  });
};

// Reverse geocode via OpenStreetMap Nominatim — no API key needed.
// Swap for Google Geocoding if you already have a key configured elsewhere.
async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return (
      data?.address?.suburb ||
      data?.address?.city ||
      data?.display_name ||
      undefined
    );
  } catch (e) {
    console.error("[PiAuth] Reverse geocode failed:", e);
    return undefined;
  }
}

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // True as soon as Pi Network identity auth (window.Pi.authenticate) succeeds —
  // independent of the separate SDKLite/payments login below, which can fail
  // for unrelated reasons and used to silently block "Basic" security / "Not
  // connected" verification even for a genuinely Pi-verified user.
  const [isPiVerified, setIsPiVerified] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [restoredPurchases, setRestoredPurchases] = useState<
    UserPurchaseBalance[] | null
  >(null);
  const [user, setUser] = useState<PiUser | null>(null);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[PiAuthProvider] Mounted, initializing...");
  }, []);

  useEffect(() => {
    console.log("[PiAuthProvider] isInitialized changed to:", isInitialized);
  }, [isInitialized]);

  const fetchProducts = async (sdkInstance: SDKLiteInstance): Promise<void> => {
    try {
      const { products } = await sdkInstance.state.products();
      setProducts(products);
    } catch (e) {
      console.error("Failed to load products:", e);
      setProducts([]);
    }
  };

  const requestLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        const label = await reverseGeocode(lat, lng);
        if (label) {
          setLocation({ lat, lng, label });
        }
      },
      (err) => {
        console.error("[PiAuth] Location request failed:", err);
        setLocationError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const initialize = async () => {
    console.log("[PiAuth] Initialize called");
    const isPiBrowser =
      typeof window !== "undefined" &&
      typeof (window as any).Pi !== "undefined";

    console.log("[PiAuth] isPiBrowser:", isPiBrowser);

    if (!isPiBrowser) {
      // ✅ Chrome / Vercel - نفتح المنصة بدون Pi auth
      console.log("[PiAuth] Not in Pi Browser - opening app normally");
      flushSync(() => {
        setIsAuthenticated(true);
        setAuthMessage("App loaded successfully");
        setIsInitialized(true);
      });
      return;
    }

    // Pi Browser flow
    setHasError(false);
    setRestoredPurchases(null);
    try {
      setAuthMessage("Loading Pi SDK...");
      await loadPiSDK();
      setAuthMessage("Initializing Pi Network...");
      await window.Pi.init({
        version: "2.0",
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      });
      setAuthMessage("Authenticating with Pi...");
      const authResult = await window.Pi.authenticate(
        ['payments', 'username'],
        (payment: any) => {
          console.log('[PiAuth] Incomplete payment found:', payment);
        }
      );
      console.log('[PiAuth] Authenticated:', authResult.user.username);
      setUsername(authResult.user.username);
      setAccessToken(authResult.accessToken);
      setIsPiVerified(true);

      // Persist the authenticated user so the rest of the app (dashboard, etc.) can read it
      setUser({
        uid: authResult.user.uid,
        username: authResult.user.username,
      });

      setAuthMessage("Loading SDKLite...");
      await loadSDKLite();

      setAuthMessage("Initializing SDKLite...");
      const sdkInstance = await window.SDKLite.init();
      setAuthMessage("Logging in...");
      const success = await sdkInstance.login();
      if (!success) {
        throw new Error("Login failed. Please try again.");
      }

      setSdk(sdkInstance);
      setIsAuthenticated(true);
      await fetchProducts(sdkInstance);

      try {
        const { purchases } = await sdkInstance.state.restore();
        setRestoredPurchases(purchases);
        console.log("[PiAuth] Purchases restored", purchases);
      } catch (e) {
        console.error("[PiAuth] Failed to restore purchases:", e);
        setRestoredPurchases([]);
      }

      // Ask for real location once the user is authenticated (not blocking)
      requestLocation();
    } catch (err) {
      console.error("SDKLite initialization failed:", err);
      setHasError(true);
      setAuthMessage(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again."
      );
    } finally {
      console.log("[PiAuth] Setting isInitialized to true");
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    isPiVerified,
    isInitialized,
    authMessage,
    hasError,
    sdk,
    products,
    restoredPurchases,
    username,
    accessToken,
    user,
    location,
    locationError,
    requestLocation,
    reinitialize: initialize,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
