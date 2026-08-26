import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ContractDetailView } from '@/components/contract-detail-view';
import type { SmartContract } from '@/lib/firebase-database';

async function getContract(id: string): Promise<SmartContract | null> {
  try {
    const snap = await getDoc(doc(db, 'contracts', id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as SmartContract;
  } catch (e) {
    console.error('[verify] fetch error:', e);
    return null;
  }
}

export default async function VerifyContractPage({ params }: { params: { id: string } }) {
  const contract = await getContract(params.id);

  if (!contract) {
    return (
      <main className="min-h-screen bg-[#08080a] text-stone-300 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-lg text-stone-200">Contract not found</p>
          <p className="text-sm text-stone-500">This link may be invalid or the record was removed.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080a] py-10 px-4"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(201,162,39,0.06), transparent 60%)' }}>
      <ContractDetailView contract={contract} />
      <p className="text-center text-[11px] text-stone-600 mt-6 max-w-[560px] mx-auto">
        This is a publicly verifiable record on RE Global. Anyone with this link can view the contract's
        signed status and hash — no login required.
      </p>
    </main>
  );
}
