'use client'
import { useSubscription } from '@/hooks/useSubscription'

export default function RentalSubscription({ propertyId, price }: { propertyId: string, price: number }) {
  const { subscribe, loading, error } = useSubscription()

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-2">اشترك في الإيجار</h3>
      <p className="text-sm mb-4">السعر: {price} Pi / شهر</p>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={() => subscribe(Number(propertyId), true)}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'جاري المعالجة...' : 'اشترك الآن بـ Pi'}
      </button>
    </div>
  )
}
