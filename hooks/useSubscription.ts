import { useState } from 'react'
import { CONTRACT_ID, RPC_URL } from '@/lib/contract'

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function subscribe(serviceId: number, autoRenew: boolean) {
    setLoading(true)
    setError(null)
    try {
      const payment = await (window as any).Pi.createPayment({
        amount: 1,
        memo: `rental_subscription_${serviceId}`,
        metadata: {
          contract_id: CONTRACT_ID,
          service_id: serviceId,
          auto_renew: autoRenew
        }
      })
      return payment
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { subscribe, loading, error }
}
