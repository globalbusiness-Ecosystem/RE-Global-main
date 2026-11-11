// Which way a person can pay right now. Pi inside the Pi Browser; a card outside it (card payments are switched on
// only once a payment provider is connected — see CARD_PAYMENTS_ENABLED).
export const CARD_PAYMENTS_ENABLED = false;

type PayMethod = 'pi' | 'signin' | 'card-soon' | 'card';

export function payMethod(o: { inPiBrowser: boolean; signedIn: boolean; cardEnabled?: boolean }): PayMethod {
  if (o.inPiBrowser) return 'pi';
  if (!o.signedIn) return 'signin';
  return (o.cardEnabled ?? CARD_PAYMENTS_ENABLED) ? 'card' : 'card-soon';
}
