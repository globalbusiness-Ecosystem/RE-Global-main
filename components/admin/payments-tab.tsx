'use client';

import PayoutsPanel from './payouts-panel';
import MarketFeeSettings from './market-fee-settings';
import MarketAdminPanel from './market-admin-panel';
import BookingsPanel from './bookings-panel';
import BlockDates from './block-dates';
import ReviewsPanel from './reviews-panel';
import ReviewStats from './review-stats';
import CancellationSettings from './cancellation-settings';
import OccupancyPanel from './occupancy-panel';
import ArrivalsPanel from './arrivals-panel';
import HoldingsPanel from './holdings-panel';
import PaymentsList from './payments-list';
import SubTabs from './sub-tabs';

export default function PaymentsTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const u = onUnauthorized;
  return (
    <SubTabs
      storeKey="payments"
      tabs={[
        { id: 'payments', icon: '💳', label: 'المدفوعات', render: () => <PaymentsList onUnauthorized={u} /> },
        { id: 'payouts', icon: '💸', label: 'التحويلات والاستردادات', render: () => <PayoutsPanel onUnauthorized={u} /> },
        {
          id: 'bookings', icon: '🛏️', label: 'الحجوزات',
          render: () => (
            <>
              <BookingsPanel onUnauthorized={u} />
              <ArrivalsPanel onUnauthorized={u} />
              <OccupancyPanel onUnauthorized={u} />
              <BlockDates onUnauthorized={u} />
            </>
          ),
        },
        {
          id: 'policies', icon: '⭐', label: 'التقييمات والسياسات',
          render: () => (
            <>
              <ReviewStats onUnauthorized={u} />
              <ReviewsPanel onUnauthorized={u} />
              <CancellationSettings onUnauthorized={u} />
            </>
          ),
        },
        {
          id: 'shares', icon: '🧩', label: 'سوق الحصص',
          render: () => (
            <>
              <HoldingsPanel onUnauthorized={u} />
              <MarketAdminPanel onUnauthorized={u} />
              <MarketFeeSettings onUnauthorized={u} />
            </>
          ),
        },
      ]}
    />
  );
}
