# Payment Processing - Quick Reference Guide

## File Locations

| File | Purpose | Location |
|------|---------|----------|
| Payment API | Handle payment requests | `/app/api/payments/route.ts` |
| Transaction Manager | Core payment logic | `/lib/transaction-manager.ts` |
| Payment Button | Payment UI component | `/components/advanced-payment-button.tsx` |
| Payment Dashboard | Wallet & history | `/components/pages/payment-page.tsx` |

## Quick Start

### 1. Use Payment Button in Property Card
```typescript
import { AdvancedPaymentButton } from '@/components/advanced-payment-button';

<AdvancedPaymentButton
  propertyId="prop_001"
  propertyTitle="Villa"
  price={1.5}
  currency="PI"
  transactionType="buy"
  language="en"
/>
```

### 2. Access Wallet Data
```typescript
import { useTransactionManager } from '@/lib/transaction-manager';

const manager = useTransactionManager();
const wallet = await manager.getWallet('user_123');
console.log(`Balance: ${wallet.balance} ${wallet.currency}`);
```

### 3. Process Payment
```typescript
const result = await manager.processPayment(
  'user_123',
  1.5,
  'PI',
  'buy',
  'prop_001',
  'Property Title'
);
```

## API Endpoints

### POST /api/payments
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "amount": 1.5,
    "currency": "PI",
    "transactionType": "buy",
    "propertyId": "prop_001",
    "propertyTitle": "Luxury Villa"
  }'
```

### GET /api/payments
```bash
curl "http://localhost:3000/api/payments?userId=user_123"
curl "http://localhost:3000/api/payments?userId=user_123&type=buy"
```

## Component Props

### AdvancedPaymentButton
```typescript
interface AdvancedPaymentButtonProps {
  propertyId: string;           // Property identifier
  propertyTitle: string;        // Property name
  price: number;                // Amount to charge
  currency: 'PI' | 'USD';       // Currency type
  transactionType: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized';
  language: 'en' | 'ar';        // UI language
  userId?: string;              // User identifier
  onSuccess?: (result) => void; // Success callback
  onError?: (error) => void;    // Error callback
  className?: string;           // Custom CSS
  showModal?: boolean;          // Show feedback modal
}
```

### PaymentPage
```typescript
interface PaymentPageProps {
  language: 'en' | 'ar';        // UI language
  userId?: string;              // User identifier
  onBack?: () => void;          // Back navigation
}
```

## Transaction Types

| Type | Use Case | Icon |
|------|----------|------|
| buy | Direct purchase | 🏠 |
| rent | Monthly rental | 🔑 |
| hotel | Hotel booking | 🏨 |
| invest | Investment | 💰 |
| tokenized | Token purchase | 📊 |

## Status Codes

| Status | Color | Meaning |
|--------|-------|---------|
| pending | Yellow | Processing |
| completed | Green | Success ✓ |
| failed | Red | Error ✗ |
| refunded | Blue | Refunded |

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | Missing userId/amount/propertyId | Check all fields included |
| "Amount must be > 0" | Invalid amount | Use positive number |
| "Insufficient balance" | Not enough funds | Add funds to wallet |
| "Payment processing failed" | API error | Check network connection |

## Integration Checklist

- [ ] Import AdvancedPaymentButton in property card
- [ ] Add payment page to navigation
- [ ] Test with different transaction types
- [ ] Test error scenarios
- [ ] Configure bilingual labels
- [ ] Setup payment success callbacks
- [ ] Test on mobile device
- [ ] Verify wallet updates
- [ ] Test transaction history
- [ ] Setup error logging

## Testing Commands

```bash
# Test payment processing
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","amount":1.5,"currency":"PI","transactionType":"buy","propertyId":"prop_001","propertyTitle":"Test Property"}'

# Get wallet balance
curl "http://localhost:3000/api/payments?userId=user_123"

# Get transaction history
curl "http://localhost:3000/api/payments?userId=user_123&type=buy"
```

## Common Tasks

### Add Payment to Property Card
1. Import AdvancedPaymentButton
2. Add component with propertyId, title, price
3. Set language prop
4. Add onSuccess handler
5. Test payment flow

### View Transaction History
1. Navigate to Payment Page
2. Select transaction type filter
3. View filtered transactions
4. Click refresh to update

### Debug Payment Issues
1. Check browser console for errors
2. Review network tab in DevTools
3. Check API response status
4. Verify user ID and amount

### Handle Payment Errors
1. Check balance is sufficient
2. Verify amount is > 0
3. Check userId is valid
4. Review error message
5. Retry payment

## Performance Tips

- Use pagination for large transaction lists
- Cache wallet data with 30s refresh
- Lazy load payment page components
- Optimize images in transaction list
- Use debouncing for filters

## Security Notes

- Never expose user private keys
- Validate all inputs server-side
- Use HTTPS in production
- Implement rate limiting
- Add CSRF protection
- Log all transactions
- Monitor for fraud

## Deployment Checklist

Before going to production:
- [ ] Replace mock wallet with real database
- [ ] Integrate Pi Network SDK
- [ ] Add transaction verification
- [ ] Implement rate limiting
- [ ] Add payment webhooks
- [ ] Setup error alerts
- [ ] Configure backup payment method
- [ ] Setup transaction audit logs
- [ ] Test with real Pi Network
- [ ] Performance test with load

## Support

**Issues?** Check these first:
1. Is userId provided?
2. Is amount valid (> 0)?
3. Is wallet initialized?
4. Network connection ok?
5. Check console errors

**Still stuck?**
- Email: globalbusiness435@gmail.com
- WhatsApp: +201010810558

---

**Last Updated:** May 12, 2026  
**Version:** 1.0.0
