const CONTRACT_ID = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT!
const RPC_URL = process.env.NEXT_PUBLIC_PI_RPC!

export async function callContract(method: string, params: Record<string, any> = {}) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  })
  return response.json()
}

export { CONTRACT_ID, RPC_URL }

/* ------------------------------------------------------------------ */
/* User-facing contract helpers for the dashboard                      */
/* ------------------------------------------------------------------ */

export interface UserContract {
  id: string;
  propertyId: string;
  counterparty: string;
  valuePi: number;
  status: 'pending_signature' | 'in_escrow' | 'active' | 'completed';
  createdAt: number;
}

/**
 * ⚠️ IMPORTANT: "getUserContracts" below is a placeholder RPC method name.
 * Open your contract's ABI / the Rust or Solidity source for
 * NEXT_PUBLIC_SUBSCRIPTION_CONTRACT and swap it for the real read method
 * you use to list a wallet's contracts (e.g. "get_contracts_by_owner",
 * "listAgreements", etc). This function will 404 or return an RPC error
 * until that method name is corrected.
 */
export async function getUserContracts(userWalletAddress: string): Promise<UserContract[]> {
  const result = await callContract('getUserContracts', {
    contract: CONTRACT_ID,
    owner: userWalletAddress,
  });

  if (result.error) {
    console.error('[contract] getUserContracts RPC error:', result.error);
    return [];
  }

  return (result.result ?? []) as UserContract[];
}
