export interface PurchaseResult {
  ok: true;
  productId: string;
  paymentId: string;
  txid: string;
}

export interface SDKLiteError extends Error {
  name: "SDKLiteError";
  code: "product_not_found" | "purchase_cancelled" | "purchase_error";
}

export interface UserStateRecord {
  blob: Record<string, unknown>;
  updatedAt: string;
  version: number;
}

export interface UserPurchaseBalance {
  productId: string;
  quantity: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_in_pi: number;
  total_quantity: number;
  is_active: boolean;
  is_consumable: boolean;
  created_at: string;
}

export interface ProductsResponse {
  products: Product[];
}

export interface PurchasesResponse {
  purchases: UserPurchaseBalance[];
}

export interface ConsumeResponse {
  productId: string;
  quantity: number;
}

export interface RestoreOptions {
  keys?: string[];
}

export interface SDKLiteState {
  get: (key: string) => Promise<UserStateRecord | null>;
  set: (key: string, blob: Record<string, unknown>) => Promise<void>;
  products: () => Promise<ProductsResponse>;
  purchases: () => Promise<PurchasesResponse>;
  consume: (productId: string, quantity?: number) => Promise<ConsumeResponse>;
  restore: (options?: RestoreOptions) => Promise<PurchasesResponse>;
}

export interface SDKLiteInstance {
  login: () => Promise<boolean>;
  makePurchase: (productId: string) => Promise<PurchaseResult>;
  showInterstitial: () => Promise<boolean>;
  showRewarded: (productId: string) => Promise<boolean>;
  isAdNetworkSupported: () => Promise<boolean>;
  state: SDKLiteState;
}

declare global {
  interface Window {
    SDKLite: {
      init: () => Promise<SDKLiteInstance>;
    };
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[], onIncompletePaymentFound?: (payment: any) => void) => Promise<{ user: { uid: string; username: string }; accessToken: string }>;
      createPayment: (paymentData: { amount: number; memo: string; metadata: Record<string, any>; }, callbacks: { onReadyForServerApproval: (paymentId: string) => void; onReadyForServerCompletion: (paymentId: string, txid: string) => void; onCancel: (paymentId: string) => void; onError: (error: Error, payment?: any) => void; }) => void;
    };
  }
}
