import { Keypair } from '@stellar/stellar-sdk';
import crypto from 'crypto';

export interface ContractInput {
  contractId: string;
  propertyId: string;
  propertyTitle: string;
  buyerUsername: string;
  sellerUsername: string;
  type: string;
  amount: number;
  currency: string;
  paymentId: string;
  txid: string;
}

export function generateContractText(c: ContractInput): string {
  return `RE GLOBAL — PROPERTY TRANSACTION CONTRACT
Status: PILOT / TESTNET — Pending UAE Legal Review (Federal Decree-Law No. 46/2021)

Contract ID: ${c.contractId}
Date: ${new Date().toISOString()}

PARTIES
Party A (Buyer): @${c.buyerUsername} — identity verified via Pi Network payment
Party B (Platform): RE Global (${c.sellerUsername})

SUBJECT
Property: ${c.propertyTitle} (ID: ${c.propertyId})
Transaction type: ${c.type}
Amount: ${c.amount} ${c.currency}

TERMS
1. Subject matter. The Buyer agrees to purchase, and the Platform agrees to transfer rights to, the property described above, subject to the terms herein.
2. Consideration. The Buyer has paid the amount stated above via the Pi Network payment system (Payment ID: ${c.paymentId}, Transaction: ${c.txid}).
3. Proof of transaction. The parties agree that the on-chain Pi Network transaction record constitutes conclusive evidence of payment and of the Buyer's assent to this contract.
4. Property condition. Where a certified RE Inspect report exists for this property, its findings and Health Score are incorporated into this contract by reference via the linked certificate hash.
5. Pilot phase. This contract is issued during a technical pilot phase and does not yet constitute a legally binding real estate conveyance until reviewed and confirmed compliant with applicable law.
6. Governing law. Upon legal finalization, this contract shall be governed by the laws of the United Arab Emirates.`;
}

export function hashContract(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export function signContractHash(hashHex: string, secretKey: string): string {
  const keypair = Keypair.fromSecret(secretKey);
  const signature = keypair.sign(Buffer.from(hashHex, 'hex'));
  return signature.toString('base64');
}

export function verifyContractSignature(hashHex: string, signatureBase64: string, publicKey: string): boolean {
  try {
    const keypair = Keypair.fromPublicKey(publicKey);
    return keypair.verify(Buffer.from(hashHex, 'hex'), Buffer.from(signatureBase64, 'base64'));
  } catch {
    return false;
  }
}
