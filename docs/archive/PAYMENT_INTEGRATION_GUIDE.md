# Payment Integration Guide - RE Platform

## Overview
Complete Pi Network payment processing system for the RE Platform with wallet management, transaction tracking, and advanced payment features.

## Architecture

### 1. Payment API (`/app/api/payments/route.ts`)
- **POST**: Process payment transactions
- **GET**: Retrieve wallet and transaction history
- Validates transaction data and wallet balance
- Returns transaction ID and payment status

### 2. Transaction Manager (`/lib/transaction-manager.ts`)
- Manages all payment operations
- Handles wallet creation and balance tracking
- Formats transactions and currencies
- Provides utility methods for UI components

### 3. Payment Components

#### AdvancedPaymentButton (`/components/advanced-payment-button.tsx`)
- Modern payment button with modal feedback
- Shows processing, success, and error states
- Bilingual support (English/Arabic)
- Transaction details confirmation
- Retry on failure capability

#### PaymentPage (`/components/pages/payment-page.tsx`)
- Complete wallet dashboard
- Transaction history with filtering
- Balance display and statistics
- Real-time wallet updates
- Add funds and withdrawal options (stubs)

## Implementation Examples

### 1. Basic Payment Processing

```typescript
import { useTransactionManager } from '@/lib/transaction-manager';

const transactionManager = useTransactionManager();

const result = await transactionManager.processPayment(
  'user_123',           // userId
  1.5,                  // amount in Pi
  'PI',                 // currency
  'buy',                // transaction type
  'prop_001',           // propertyId
  'Luxury Villa Cairo', // propertyTitle
  { location: 'Cairo' } // metadata
);

if (result.success) {
  console.log('Payment successful:', result.data.transactionId);
} else {
  console.error('Payment failed:', result.error);
}
```

### 2. Using AdvancedPaymentButton Component

```typescript
import { AdvancedPaymentButton } from '@/components/advanced-payment-button';

function PropertyCard() {
  return (
    <AdvancedPaymentButton
      propertyId="prop_001"
      propertyTitle="Luxury Villa"
      price={1.5}
      currency="PI"
      transactionType="buy"
      language="en"
      userId="user_123"
      onSuccess={(result) => {
        console.log('Payment successful:', result);
        // Handle successful payment
      }}
      onError={(error) => {
        console.error('Payment error:', error);
        // Handle error
      }}
      showModal={true}
    />
  );
}
```

### 3. Accessing Wallet Information

```typescript
const transactionManager = useTransactionManager();

// Get wallet data
const wallet = await transactionManager.getWallet('user_123');
console.log(`Balance: ${wallet.balance} ${wallet.currency}`);
console.log(`Total Spent: ${wallet.totalSpent}`);
console.log(`Total Earned: ${wallet.totalEarned}`);

// Get transaction history
const transactions = await transactionManager.getTransactionHistory('user_123', 10);
transactions.forEach(tx => {
  console.log(`${tx.propertyTitle}: ${tx.amount} ${tx.currency}`);
});
```

### 4. Integrating Payment Page into Navigation

```typescript
// In app/page.tsx
case 'payment':
  return (
    <PaymentPage
      language={language}
      userId="user_123"
      onBack={() => handlePageChange('dashboard')}
    />
  );
```

## API Endpoints

### POST /api/payments
Process a payment transaction

**Request:**
```json
{
  "userId": "user_123",
  "amount": 1.5,
  "currency": "PI",
  "transactionType": "buy",
  "propertyId": "prop_001",
  "propertyTitle": "Luxury Villa Cairo",
  "metadata": { "location": "Cairo" }
}
```

**Response (Success):**
```json
{
  "success": true,
  "paymentId": "pay_1234567890_abc",
  "transactionId": "tx_1234567890_abc",
  "amount": 1.5,
  "currency": "PI",
  "status": "completed",
  "timestamp": "2026-05-12T10:30:00Z",
  "message": "Payment of 1.5 PI processed successfully for Luxury Villa Cairo"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Insufficient balance in wallet",
  "currentBalance": 0.8,
  "requiredAmount": 1.5
}
```

### GET /api/payments?userId=user_123&type=buy
Retrieve wallet and transactions

**Response:**
```json
{
  "wallet": {
    "userId": "user_123",
    "balance": 998.5,
    "currency": "PI",
    "totalSpent": 1.5,
    "totalEarned": 0,
    "createdAt": "2026-05-12T09:00:00Z"
  },
  "transactions": [
    {
      "transactionId": "tx_1234567890_abc",
      "paymentId": "pay_1234567890_abc",
      "userId": "user_123",
      "amount": 1.5,
      "currency": "PI",
      "transactionType": "buy",
      "propertyId": "prop_001",
      "propertyTitle": "Luxury Villa Cairo",
      "status": "completed",
      "timestamp": "2026-05-12T10:30:00Z",
      "description": "BUY: Luxury Villa Cairo"
    }
  ]
}
```

## Transaction Types

| Type | Label (EN) | Label (AR) | Purpose |
|------|-----------|-----------|---------|
| buy | Property Purchase | شراء عقار | Direct property purchase |
| rent | Property Rental | استئجار عقار | Monthly rental payment |
| hotel | Hotel Booking | حجز فندق | Hotel reservation booking |
| invest | Investment | استثمار | Real estate investment |
| tokenized | Tokenized Property | عقار معروق | Blockchain token purchase |

## Status Types

| Status | Description |
|--------|-------------|
| pending | Payment being processed |
| completed | Payment successfully completed |
| failed | Payment failed |
| refunded | Payment refunded |

## Currency Support

| Code | Symbol | Type |
|------|--------|------|
| PI | π | Pi Network cryptocurrency |
| USD | $ | US Dollar (fiat) |

## Wallet Features

### Balance Management
- View current balance
- Track total spent
- Monitor total earned
- View balance history

### Transaction Tracking
- Complete transaction history
- Filter by transaction type
- View transaction details
- Download statements (future)

### Security Features
- User-specific wallets
- Transaction verification
- Secure payment processing
- Anti-fraud validation

## Integration Checklist

- [x] Payment API endpoint created
- [x] Transaction manager implemented
- [x] AdvancedPaymentButton component
- [x] Payment page with wallet dashboard
- [x] Bilingual support (EN/AR)
- [ ] Real Pi Network SDK integration
- [ ] Database persistence (Firebase/Neon)
- [ ] Payment webhooks
- [ ] Refund handling
- [ ] Transaction export
- [ ] Payment analytics
- [ ] Fraud detection

## Production Deployment

### Before Going Live

1. **Database Integration**
   - Replace in-memory storage with real database
   - Use Supabase or Firebase for persistence
   - Implement transaction logging

2. **Pi Network SDK**
   - Integrate official Pi Network SDK
   - Verify wallet addresses
   - Implement transaction verification

3. **Security**
   - Add rate limiting
   - Implement CSRF protection
   - Add payment verification
   - Enable transaction auditing

4. **Testing**
   - Test all transaction types
   - Verify wallet updates
   - Test error scenarios
   - Performance testing with load

5. **Monitoring**
   - Add transaction logging
   - Monitor payment success rates
   - Track payment errors
   - Alert on failures

## Testing

### Test Scenarios

```typescript
// Test 1: Successful payment
await transactionManager.processPayment(
  'test_user',
  1.0,
  'PI',
  'buy',
  'test_prop',
  'Test Property'
);

// Test 2: Insufficient balance
// Should fail with error

// Test 3: Invalid user
// Should create new wallet

// Test 4: Multiple transactions
// Should accumulate totalSpent

// Test 5: Transaction filtering
const buyTransactions = await transactionManager.getTransactions(
  'test_user',
  'buy'
);
```

## Future Enhancements

1. **Advanced Features**
   - Escrow payments for secure transactions
   - Recurring payments for rentals
   - Multi-currency conversion
   - Payment scheduling

2. **User Experience**
   - One-click payments
   - Saved payment methods
   - Payment reminders
   - Receipt generation

3. **Analytics**
   - Payment trends
   - Revenue reports
   - User spending patterns
   - Conversion metrics

4. **Integration**
   - Stripe backup payment
   - Apple Pay / Google Pay
   - Bank transfers
   - Wire transfers

## Support

For payment-related issues:
- Email: globalbusiness435@gmail.com
- WhatsApp: +201010810558
- Technical: Review logs in `/app/api/payments/route.ts`

## Changelog

### Version 1.0.0 (2026-05-12)
- Initial payment system implementation
- Pi Network wallet support
- Transaction management
- Bilingual UI
- Payment dashboard
