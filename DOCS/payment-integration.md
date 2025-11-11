# 💳 Payment Integration Status

**Status:** 🔴 **STUBBED - Not Production Ready**
**Last Updated:** November 11, 2025

---

## Executive Summary

The payment system has a **solid foundation** with database schema, quota enforcement, and premium UI complete. However, **NO actual payment processing** is implemented. The upgrade API automatically grants premium access without charging users.

**Current State:** Demo/testing only
**Production Ready:** ❌ No
**Time to Production:** 8-10 hours

---

## ✅ What's Implemented

### 1. Database Schema (100% Complete)

```prisma
model Subscription {
  id              String             @id @default(cuid())
  userId          String             @unique
  tier            SubscriptionTier   @default(FREE)
  status          SubscriptionStatus @default(ACTIVE)
  startDate       DateTime           @default(now())
  endDate         DateTime?
  autoRenew       Boolean            @default(false)
  paymentMethod   String?
  lastPaymentDate DateTime?
  amount          Float?
  currency        String             @default("INR")
}

enum SubscriptionTier {
  FREE, PREMIUM, PREMIUM_PLUS
}
```

### 2. Quota System (100% Working)

**File:** `lib/quotas.ts`

```typescript
export const QUOTA_LIMITS = {
  FREE: {
    daily_likes: 10,
    weekly_super_likes: 5,
    weekly_interests: 15,
  },
  PREMIUM: {
    daily_likes: Infinity,
    weekly_super_likes: Infinity,
    weekly_interests: Infinity,
  },
  PREMIUM_PLUS: {
    daily_likes: Infinity,
    weekly_super_likes: Infinity,
    weekly_interests: Infinity,
  },
}
```

**Functions:**
- ✅ `getUserTier()` - Gets subscription
- ✅ `checkQuota()` - Validates action
- ✅ `incrementQuota()` - Tracks usage
- ✅ `getRemainingQuotas()` - Returns remaining

### 3. Premium Paywalls (100% Working)

**Likes Page:** `/app/likes/page.tsx`
- Blurs "who liked you" for free users
- Shows upgrade CTA
- Only premium users see profiles

### 4. Premium UI (100% Complete)

**Page:** `/app/premium/page.tsx`

**Pricing:**
- FREE: ₹0
- PREMIUM: ₹799/month ⚠️ (API says ₹999 - inconsistent!)
- PREMIUM_PLUS: ₹1,999/month

**Features Listed:**
- Unlimited likes
- Unlimited super likes
- Unlimited interests
- See who liked you
- Priority visibility
- Advanced filters
- Monthly video profile
- Read receipts

---

## ❌ What's Missing (CRITICAL)

### 1. Payment Gateway Integration

**Status:** ❌ Not configured
**Impact:** Can't process real payments

**Required:**
- Choose gateway (Razorpay recommended for India)
- Add API keys to environment
- Implement checkout flow
- Handle payment callbacks

### 2. Upgrade API is Completely Stubbed

**File:** `/app/api/subscription/upgrade/route.ts`

**Current Code:**
```typescript
// Line 31: Hardcoded pricing
const amount = tier === 'PREMIUM' ? 999 : 1999

// Line 54: DEMO PAYMENT METHOD!!!
paymentMethod: 'DEMO', // In production, this would come from payment gateway
```

**What it does:**
1. User clicks "Upgrade to Premium"
2. API automatically upgrades subscription
3. Sets payment method to 'DEMO'
4. NO payment verification
5. User gets premium for free!

**What it SHOULD do:**
1. User clicks "Upgrade"
2. Create payment session with gateway
3. Redirect to payment page
4. Wait for webhook confirmation
5. THEN upgrade subscription

### 3. No Webhook Handler

**Missing:** `/api/webhooks/razorpay` or `/api/webhooks/stripe`

**Needed for:**
- Payment confirmation
- Subscription renewal
- Payment failures
- Refund processing

### 4. No Subscription Management

**Missing Features:**
- ❌ Cancel subscription
- ❌ Pause subscription
- ❌ View payment history
- ❌ Download invoices
- ❌ Update payment method
- ❌ Handle failed payments

### 5. Pricing Inconsistency

**Issue:** Two different prices for PREMIUM tier

**Premium Page (line 201):**
```tsx
<span className="text-4xl font-bold">₹799</span>
```

**Upgrade API (line 31):**
```typescript
const amount = tier === 'PREMIUM' ? 999 : 1999
```

**Fix:** Decide on correct price and update both

---

## 🚀 Implementation Plan

### Phase 1: Choose & Configure Gateway

**Recommended:** Razorpay (best for India)

**Environment Variables:**
```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

**Alternative:** Stripe (global)

### Phase 2: Update Upgrade Route

Replace `/app/api/subscription/upgrade/route.ts`:

```typescript
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  const { tier } = await request.json()

  // Validate tier
  const amount = tier === 'PREMIUM' ? 79900 : 199900 // Amount in paise

  // Create Razorpay order
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `sub_${Date.now()}`,
  })

  // Return order for frontend
  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  })
}
```

### Phase 3: Update Premium Page

Add Razorpay checkout:

```typescript
const handleUpgrade = async (tier: string) => {
  // Create order
  const response = await fetch('/api/subscription/upgrade', {
    method: 'POST',
    body: JSON.stringify({ tier }),
  })
  const { orderId, amount } = await response.json()

  // Open Razorpay checkout
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'Believers Matrimony',
    order_id: orderId,
    handler: function (response: any) {
      // Payment successful - verify on backend
      verifyPayment(response)
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}
```

### Phase 4: Add Webhook Handler

Create `/app/api/webhooks/razorpay/route.ts`:

```typescript
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  // Verify webhook signature
  const isValid = verifyWebhookSignature(body, signature)

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    // Payment successful - upgrade user
    await upgradeSubscription(event.payload.payment.entity)
  }

  return NextResponse.json({ received: true })
}
```

### Phase 5: Add Subscription Management

- Cancel endpoint
- Payment history page
- Invoice generation
- Auto-renewal logic

**Time Estimate:** 8-10 hours total

---

## 🔧 Quota Enforcement (WORKING)

### How It Works

**Check Before Action:**
```typescript
// In /api/likes/route.ts
const canLike = await checkQuota(userId, 'likes')
if (!canLike) {
  return NextResponse.json({
    error: 'Daily like limit reached',
    message: 'Upgrade to Premium for unlimited likes',
    upgradeUrl: '/premium'
  }, { status: 429 })
}
```

**Increment After Action:**
```typescript
await incrementQuota(userId, 'likes')
```

### Enforced On

- ✅ `/api/likes` - 10/day for free, unlimited for premium
- ✅ `/api/interests` - 15/week for free, unlimited for premium
- ✅ `/api/super-likes` - 5/week for free, unlimited for premium

---

## 📊 Current Pricing Structure

| Feature | FREE | PREMIUM | PREMIUM PLUS |
|---------|------|---------|--------------|
| **Price** | ₹0 | ₹799/mo | ₹1,999/mo |
| **Likes** | 10/day | ∞ | ∞ |
| **Super Likes** | 5/week | ∞ | ∞ |
| **Interests** | 15/week | ∞ | ∞ |
| **See Who Liked You** | ❌ | ✅ | ✅ |
| **Priority Visibility** | ❌ | ✅ | ✅ |
| **Advanced Filters** | ❌ | ✅ | ✅ |
| **Video Profile** | ❌ | ❌ | ✅ |
| **Read Receipts** | ❌ | ✅ | ✅ |

⚠️ **Note:** Some features (video profile, read receipts) are listed but not implemented.

---

## 💰 Revenue Calculations

### Monthly Revenue Potential

**Assumptions:**
- 1,000 users
- 10% conversion to PREMIUM
- 2% conversion to PREMIUM_PLUS

**Calculation:**
```
FREE users:     880 × ₹0        = ₹0
PREMIUM users:  100 × ₹799      = ₹79,900
PREMIUM+ users:  20 × ₹1,999    = ₹39,980
                                 ─────────
Total:                           ₹1,19,880/month
Minus Razorpay fees (2%):       -₹2,398
Net Revenue:                     ₹1,17,482/month
```

**At Scale (10,000 users):**
Net Revenue: ₹11,74,820/month (~₹14.1 lakhs/month)

---

## 🔐 Security Considerations

### Payment Security

1. **Never store card details** - Gateway handles this
2. **Verify webhooks** - Check signature
3. **Use HTTPS only** - Mandatory
4. **Log transactions** - Audit trail
5. **Handle failures** - Retry logic

### Subscription Security

1. **Verify on backend** - Don't trust client
2. **Check expiry** - Before granting access
3. **Handle grace periods** - Failed payments
4. **Prevent downgrade exploits** - Validate transitions

---

## 🧪 Testing Checklist

### Before Production

- [ ] Razorpay test mode working
- [ ] Payment flow end-to-end
- [ ] Webhook receives payments
- [ ] Subscription upgrades correctly
- [ ] Quota limits enforced
- [ ] Premium features unlock
- [ ] Failed payment handling
- [ ] Refund handling
- [ ] Multiple currency support (if needed)
- [ ] Pricing consistency fixed
- [ ] Transaction logging working
- [ ] Invoice generation working
- [ ] Subscription cancellation working
- [ ] Auto-renewal working

---

## 📞 Support & Resources

### Razorpay Resources
- Documentation: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/test-cards/
- Webhooks Guide: https://razorpay.com/docs/webhooks/

### Implementation Time
- **Razorpay Setup:** 2 hours
- **Upgrade Flow:** 3 hours
- **Webhook Handler:** 2 hours
- **Testing:** 2 hours
- **Subscription Management:** 3 hours
- **Total:** 8-10 hours

---

## 🎯 Next Steps

1. **Immediate:**
   - Fix pricing inconsistency (5 min)
   - Decide on payment gateway (Razorpay recommended)

2. **Before Launch:**
   - Set up Razorpay account
   - Implement payment flow
   - Add webhook handler
   - Test end-to-end

3. **Post Launch:**
   - Add subscription management
   - Implement invoice generation
   - Add payment history
   - Monitor transaction logs

---

*See also: `bugs-and-errors.md` for payment-related issues*
