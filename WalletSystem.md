# Wallet System Implementation Guide

## 📁 File Structure

```
project-root/
├── supabase/
│   └── migrations/
│       └── 001_wallet_system.sql          # NEW - Database schema
├── lib/
│   ├── wallet-service.js                  # NEW - Wallet service
│   ├── payments.js                        # UPDATED - Payment integration
│   └── store.js                           # UPDATED - Add wallet store
├── app/
│   ├── api/
│   │   └── wallet/
│   │       ├── route.js                   # NEW - Get wallet
│   │       ├── deposit/
│   │       │   ├── route.js               # NEW - Initialize deposit
│   │       │   └── verify/
│   │       │       └── route.js           # NEW - Verify deposit
│   │       ├── transactions/
│   │       │   └── route.js               # NEW - Get transactions
│   │       ├── statistics/
│   │       │   └── route.js               # NEW - Get statistics
│   │       ├── pay/
│   │       │   └── route.js               # NEW - Pay from wallet
│   │       ├── withdraw/
│   │       │   └── route.js               # NEW - Request withdrawal
│   │       ├── bank-accounts/
│   │       │   └── route.js               # NEW - Bank account CRUD
│   │       └── check-balance/
│   │           └── route.js               # NEW - Check balance
│   │   └── webhooks/
│   │       ├── paystack/
│   │       │   └── route.js               # UPDATED - Handle wallet deposits
│   │       └── nowpayments/
│   │           └── route.js               # UPDATED - Handle crypto deposits
│   ├── wallet/
│   │   └── deposit/
│   │       └── callback/
│   │           └── page.jsx               # NEW - Deposit callback
│   └── dashboard/
│       └── customer/
│           └── page.jsx                   # UPDATED - Add wallet tab
├── components/
│   ├── wallet/
│   │   ├── WalletDashboard.jsx           # NEW - Main wallet component
│   │   ├── BankAccountManager.jsx        # NEW - Bank account manager
│   │   └── PaymentMethodSelection.jsx    # NEW - Payment selector
│   └── BookingPayment.jsx                # UPDATED - Add wallet option
└── .env.local                             # UPDATED - Add wallet configs
```

## 🚀 Installation Steps

### Step 1: Database Setup

1. **Run the migration:**

```bash
# If using Supabase CLI
supabase migration new wallet_system
# Copy the SQL from 001_wallet_system.sql artifact
supabase db push

# OR directly in Supabase Dashboard SQL Editor
# Copy and paste the entire SQL file
```

2. **Verify tables created:**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('wallets', 'wallet_transactions', 'crypto_deposits', 'withdrawal_requests', 'user_bank_accounts');
```

### Step 2: Environment Variables

Add to your `.env.local`:

```env
# Existing variables...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# NOWPayments
NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

### Step 3: Install Dependencies

```bash
npm install
# All required packages should already be installed
```

### Step 4: Add Files

Copy each file from the artifacts to the corresponding location in your project:

**NEW FILES:**

1. `supabase/migrations/001_wallet_system.sql`
2. `lib/wallet-service.js`
3. `app/api/wallet/route.js`
4. `app/api/wallet/deposit/route.js`
5. `app/api/wallet/deposit/verify/route.js`
6. `app/api/wallet/transactions/route.js`
7. `app/api/wallet/statistics/route.js`
8. `app/api/wallet/pay/route.js`
9. `app/api/wallet/withdraw/route.js`
10. `app/api/wallet/bank-accounts/route.js`
11. `app/api/wallet/check-balance/route.js`
12. `app/wallet/deposit/callback/page.jsx`
13. `components/wallet/WalletDashboard.jsx`
14. `components/wallet/BankAccountManager.jsx`
15. `components/wallet/PaymentMethodSelection.jsx`

**UPDATED FILES:**

1. `lib/store.js` - Add wallet store
2. `app/dashboard/customer/page.jsx` - Add wallet tab
3. `app/api/webhooks/paystack/route.js` - Handle wallet deposits
4. `app/api/webhooks/nowpayments/route.js` - Handle crypto deposits

### Step 5: Update Existing Components

#### Update Customer Dashboard

In `app/dashboard/customer/page.jsx`, import and add wallet component:

```javascript
import WalletDashboard from "@/components/wallet/WalletDashboard";

// In the tab content section:
{
  activeTab === "wallet" && <WalletDashboard />;
}
```

#### Update Booking Payment Flow

In your booking payment component, add wallet option:

```javascript
import PaymentMethodSelection from "@/components/wallet/PaymentMethodSelection";

// Use the component
<PaymentMethodSelection
  bookingAmount={booking.total_amount}
  onPaymentMethodSelect={handlePaymentMethod}
/>;
```

### Step 6: Webhook Configuration

#### Paystack Webhook

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
4. Save and note the secret key

#### NOWPayments Webhook

1. Go to [NOWPayments Dashboard](https://nowpayments.io/)
2. Navigate to Settings → IPN
3. Add IPN URL: `https://yourdomain.com/api/webhooks/nowpayments`
4. Save and note the IPN secret

### Step 7: Testing

#### Test Wallet Creation

```javascript
// Sign up a new user and check wallet creation
// Wallet should be automatically created with 0 balance
```

#### Test Deposit Flow

1. Go to dashboard → Wallet tab
2. Click "Fund Wallet"
3. Enter amount (min ₦100)
4. Select Paystack
5. Complete payment
6. Check balance updated

#### Test Crypto Deposit

1. Go to dashboard → Wallet tab
2. Click "Fund Wallet"
3. Enter amount (min ₦1,000)
4. Select Cryptocurrency
5. Choose currency (e.g., BTC)
6. Complete payment
7. Check balance updated after confirmation

#### Test Wallet Payment

1. Create a booking
2. Go to payment page
3. Select "Wallet Balance"
4. Confirm payment
5. Check booking confirmed
6. Check wallet balance deducted

#### Test Withdrawal

1. Add bank account
2. Request withdrawal
3. Check pending status
4. Admin approves (you'll need admin panel)
5. Check funds transferred

### Step 8: Deploy to Production

1. **Push database changes:**

```bash
supabase db push
```

2. **Deploy your app:**

```bash
npm run build
# Deploy to your hosting (Vercel, etc.)
```

3. **Update webhooks** to production URLs

4. **Test all flows** in production

## 🔧 Usage Guide

### For Customers

**Funding Wallet:**

```
Dashboard → Wallet Tab → Fund Wallet Button
→ Enter Amount → Select Method (Paystack/Crypto)
→ Complete Payment → Balance Updated
```

**Paying from Wallet:**

```
Book Service → Proceed to Payment
→ Select "Wallet Balance" → Confirm Payment
→ Booking Confirmed → Balance Deducted
```

**Withdrawing Funds:**

```
Dashboard → Wallet Tab → Withdraw Button
→ Select/Add Bank Account → Enter Amount
→ Submit Request → Wait for Admin Approval
→ Funds Transferred
```

### For Developers

**Check Balance:**

```javascript
import { walletService } from "@/lib/wallet-service";

const { data, error } = await walletService.getWallet(userId);
console.log("Balance:", data.balance);
```

**Initialize Deposit:**

```javascript
const result = await walletService.initializeDeposit(
  userId,
  amount,
  userEmail,
  userName
);
// Redirect to: result.data.authorization_url
```

**Pay from Wallet:**

```javascript
const result = await walletService.payFromWallet(userId, bookingId, amount);
```

**Get Transactions:**

```javascript
const { data } = await walletService.getTransactions(userId, {
  type: "deposit", // optional
  status: "completed", // optional
  limit: 50, // optional
});
```

## 🐛 Troubleshooting

### Issue: Wallet not created for new users

**Solution:**

```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'create_wallet_on_user_creation';

-- Manually create wallets for existing users
INSERT INTO public.wallets (user_id, balance, currency, status)
SELECT id, 0.00, 'NGN', 'active'
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.wallets);
```

### Issue: Balance mismatch

**Solution:**

```sql
-- Run balance verification
SELECT
  w.user_id,
  w.balance as current_balance,
  COALESCE(SUM(
    CASE
      WHEN wt.transaction_type IN ('deposit', 'refund') THEN wt.amount
      WHEN wt.transaction_type IN ('payment', 'withdrawal') THEN -wt.amount
      ELSE 0
    END
  ), 0) as calculated_balance
FROM wallets w
LEFT JOIN wallet_transactions wt ON w.id = wt.wallet_id AND wt.status = 'completed'
GROUP BY w.id, w.user_id, w.balance
HAVING w.balance != COALESCE(SUM(...), 0);
```

### Issue: Webhook not working

**Solution:**

1. Test webhook locally with ngrok:

```bash
ngrok http 3000
# Use ngrok URL for webhook
```

2. Check webhook logs in provider dashboard
3. Verify signature validation in webhook handler

### Issue: Crypto deposit stuck

**Solution:**

```sql
-- Check crypto deposit status
SELECT * FROM crypto_deposits
WHERE conversion_status = 'pending'
ORDER BY created_at DESC;

-- Manually verify and update
UPDATE crypto_deposits
SET conversion_status = 'completed',
    converted_at = NOW()
WHERE payment_id = 'payment_id_here';

-- Update wallet transaction
UPDATE wallet_transactions
SET status = 'completed',
    processed_at = NOW()
WHERE id = 'transaction_id_here';

-- Update wallet balance
UPDATE wallets
SET balance = balance + amount_here
WHERE user_id = 'user_id_here';
```

## 📊 Monitoring

### Daily Checks

```sql
-- Failed transactions in last 24h
SELECT * FROM wallet_transactions
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '24 hours';

-- Pending deposits
SELECT * FROM wallet_transactions
WHERE transaction_type = 'deposit'
AND status = 'pending'
AND created_at > NOW() - INTERVAL '24 hours';

-- Pending withdrawals
SELECT * FROM withdrawal_requests
WHERE status = 'pending';
```

### Weekly Reports

```sql
-- Transaction summary
SELECT
  transaction_type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM wallet_transactions
WHERE status = 'completed'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY transaction_type;

-- Top users by wallet balance
SELECT
  u.name,
  u.email,
  w.balance
FROM wallets w
JOIN users u ON w.user_id = u.id
ORDER BY w.balance DESC
LIMIT 10;
```

## 🔒 Security Notes

1. **Never expose service role key** in frontend code
2. **Always validate webhook signatures** before processing
3. **Use RLS policies** for data access control
4. **Implement rate limiting** on deposit endpoints
5. **Log all financial transactions** for audit trail
6. **Monitor for suspicious activity** (high velocity, large amounts)

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review console logs for errors
3. Verify environment variables are set
4. Test webhooks with provider testing tools
5. Check database for failed transactions

## ✅ Production Checklist

Before going live:

- [ ] Database migrations applied
- [ ] All environment variables set
- [ ] Webhooks configured and tested
- [ ] Test all flows (deposit, payment, withdrawal)
- [ ] Security audit completed
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Error logging enabled
- [ ] Load testing performed
- [ ] Documentation updated

## 🎉 You're Ready!

Your wallet system is now fully integrated and ready for production use. Users can deposit funds, pay for bookings from their wallet, and withdraw to their bank accounts.
