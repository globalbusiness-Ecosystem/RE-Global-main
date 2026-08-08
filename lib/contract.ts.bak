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
