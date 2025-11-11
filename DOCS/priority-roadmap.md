# 🗺️ Priority Roadmap

**Believers Matrimony - Path to Production**
**Current Status:** 82% MVP Complete
**Est. Time to Production:** 1 week (40 hours)

---

## 🚨 PHASE 1: FIX BUILD (CRITICAL)

**Priority:** 🔴 **URGENT - BLOCKING**
**Time:** 5 minutes
**Status:** ❌ Not started
**Blocks:** All deployment

### Tasks
1. Fix 11 TypeScript errors
   - `app/api/discover/route.ts` - Add type annotations (lines 70, 78)
   - `app/api/prompts/route.ts` - Add type annotation (line 12)
   - `app/api/user-interests/route.ts` - Add type annotation (line 23)
   - `app/api/seed-test-data/route.ts` - Fix Prisma imports
   - `scripts/seed-prompts.ts` - Fix Prisma import

2. Verify build passes
   ```bash
   npm run build
   ```

3. Deploy to Vercel

### Success Criteria
- ✅ `npm run build` completes without errors
- ✅ Deployed to Vercel successfully

**Priority Level:** P0 - DO THIS FIRST

---

## 🔥 PHASE 2: CORE FUNCTIONALITY (HIGH)

**Priority:** 🟡 **HIGH - USER EXPERIENCE**
**Time:** 12-16 hours
**Status:** ❌ Not started
**Impact:** Makes platform fully usable

### 2.1 Real-Time Messaging (6-8 hours)

**Current Issue:** Socket.IO server exists but not running

**Tasks:**
1. Option A: Integrate Socket.IO with Next.js custom server (4 hrs)
   - Modify `server.ts` to work with Next.js
   - Update startup scripts
   - Test local deployment

2. Option B: Deploy separate Socket.IO server (3 hrs)
   - Deploy `server.ts` to separate service (Railway/Render)
   - Update `lib/socket.ts` connection URL
   - Configure CORS

3. Test real-time features (2 hrs)
   - Message delivery
   - Typing indicators
   - Online status
   - Read receipts

**Files to Modify:**
- `server.ts` - Socket.IO server
- `lib/socket.ts` - Client connection
- `package.json` - Add start script

**Success Criteria:**
- ✅ Messages appear instantly without refresh
- ✅ Typing indicators work
- ✅ Online status updates

---

### 2.2 Photo Cloud Storage (3-4 hours)

**Current Issue:** Photos stored as base64 in database (not scalable)

**Tasks:**
1. Configure Cloudinary (30 min)
   - Create account
   - Add API keys to `.env`
   - Test upload from local

2. Update photo upload flow (2 hrs)
   - Modify `components/photo-upload.tsx`
   - Update onboarding photo handler
   - Upload to Cloudinary before database insert
   - Store Cloudinary URL instead of base64

3. Migrate existing photos (1 hr)
   - Script to upload base64 photos to Cloudinary
   - Update database URLs
   - Optional: Keep as migration step

**Files to Modify:**
- `components/photo-upload.tsx`
- `app/api/onboarding/complete/route.ts`
- `app/api/profile/photos/route.ts`

**Success Criteria:**
- ✅ Photos upload to Cloudinary
- ✅ Onboarding doesn't timeout
- ✅ Photos display correctly

---

### 2.3 Test Critical Flows (2-4 hours)

**Tasks:**
1. End-to-end user flow (1 hr)
   - Register → Onboard → Browse → Like → Match → Message
   - Fix any issues found

2. Email/SMS verification (1 hr)
   - Test SendGrid email delivery
   - Test Twilio SMS (if configured)
   - Fix issues

3. Church verification (1 hr)
   - Test pastor email flow
   - Test verification link
   - Fix issues

4. Admin panel (1 hr)
   - Test photo verification
   - Test report review
   - Test user suspension

**Success Criteria:**
- ✅ Full user journey works end-to-end
- ✅ Emails deliver correctly
- ✅ Admin can approve/reject
- ✅ No major bugs found

---

## 💳 PHASE 3: PAYMENT INTEGRATION (HIGH)

**Priority:** 🟡 **HIGH - REVENUE**
**Time:** 8-10 hours
**Status:** ❌ Not started
**Impact:** Enables revenue generation

### 3.1 Choose & Configure Gateway (1 hour)

**Recommended:** Razorpay (best for India)

**Tasks:**
1. Create Razorpay account
2. Get test API keys
3. Add to environment variables
4. Install SDK: `npm install razorpay`

**Environment Variables:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

### 3.2 Implement Payment Flow (4-5 hours)

**Tasks:**
1. Update `/api/subscription/upgrade` (2 hrs)
   - Remove DEMO payment method
   - Create Razorpay order
   - Return order details to frontend

2. Update `/app/premium/page.tsx` (2 hrs)
   - Add Razorpay checkout script
   - Implement payment handler
   - Handle success/failure

3. Fix pricing inconsistency (5 min)
   - Decide: ₹799 or ₹999?
   - Update both locations

**Success Criteria:**
- ✅ Clicking "Upgrade" opens Razorpay checkout
- ✅ Test payment succeeds
- ✅ (Webhook will handle upgrade in next step)

---

### 3.3 Add Webhook Handler (2-3 hours)

**Tasks:**
1. Create `/app/api/webhooks/razorpay/route.ts` (1 hr)
   - Verify webhook signature
   - Parse payment event
   - Upgrade subscription on success

2. Configure webhook in Razorpay dashboard (30 min)
   - Add webhook URL
   - Select events to listen for
   - Test webhook delivery

3. Test payment → upgrade flow (1 hr)
   - Make test payment
   - Verify webhook received
   - Verify user upgraded
   - Verify premium features unlocked

**Success Criteria:**
- ✅ Payment triggers webhook
- ✅ Subscription upgrades automatically
- ✅ Premium features unlock
- ✅ Quota limits lifted

---

### 3.4 Subscription Management (1-2 hours)

**Tasks:**
1. Add cancel endpoint (30 min)
   - `/api/subscription/cancel`
   - Mark subscription as CANCELLED
   - Set endDate

2. Add payment history page (1 hr)
   - Show past payments
   - Show current subscription
   - Show next renewal date

**Success Criteria:**
- ✅ Users can cancel subscription
- ✅ Payment history displays
- ✅ Cancellation takes effect at period end

---

## 🛡️ PHASE 4: SECURITY & POLISH (MEDIUM)

**Priority:** 🟡 **MEDIUM - SECURITY & UX**
**Time:** 8-10 hours
**Status:** ❌ Not started
**Impact:** Production-grade security

### 4.1 Add Rate Limiting (2 hours)

**Tasks:**
1. Install rate limiting library
   ```bash
   npm install express-rate-limit redis
   ```

2. Add middleware to API routes
   - Registration: 5 attempts / 15 min
   - Login: 10 attempts / 15 min
   - Like: 100 attempts / hour
   - Message: 50 attempts / hour

**Success Criteria:**
- ✅ Brute force attacks blocked
- ✅ Spam prevented

---

### 4.2 Improve File Upload Security (2 hours)

**Tasks:**
1. Add MIME type validation
2. Add file size validation (client + server)
3. Add image dimension validation
4. Consider: virus scanning (ClamAV)

**Success Criteria:**
- ✅ Only images accepted
- ✅ Malicious files rejected

---

### 4.3 Enable Profanity Filter (1 hour)

**Current:** Code exists in `lib/profanity.ts` but not integrated

**Tasks:**
1. Add to profile submission
2. Add to message sending
3. Add to interest messages
4. Test with sample profanity

**Success Criteria:**
- ✅ Profane content blocked
- ✅ User notified appropriately

---

### 4.4 Add Error Boundaries (2 hours)

**Tasks:**
1. Create error boundary component
2. Add to root layout
3. Add to main features (discover, messages)
4. Add error reporting (optional: Sentry)

**Success Criteria:**
- ✅ Errors don't crash entire app
- ✅ User sees friendly error message

---

### 4.5 Add Password Reset (3 hours)

**Current:** Not implemented

**Tasks:**
1. Create forgot password page (1 hr)
2. Create reset token route (1 hr)
3. Create reset password page (1 hr)
4. Send reset email (integrated)

**Files to Create:**
- `/app/auth/forgot-password/page.tsx`
- `/app/auth/reset-password/[token]/page.tsx`
- `/app/api/auth/forgot-password/route.ts`
- `/app/api/auth/reset-password/route.ts`

**Success Criteria:**
- ✅ User can request reset
- ✅ Reset email delivered
- ✅ Password successfully reset

---

## 🎨 PHASE 5: POLISH & OPTIMIZATION (LOW)

**Priority:** 🟢 **LOW - NICE TO HAVE**
**Time:** 10-15 hours
**Status:** ❌ Not started
**Impact:** Better UX, not critical

### 5.1 Complete Profile Edit (3 hours)

**Current:** Page exists but incomplete

**Tasks:**
1. Load current profile data
2. Allow editing all fields
3. Handle photo updates
4. Save changes

---

### 5.2 Add Analytics Dashboard (2 hours)

**For Admin:**
- User growth charts
- Revenue charts
- Match success rate
- Popular features

---

### 5.3 Performance Optimization (3 hours)

**Tasks:**
1. Add database query optimization
2. Add caching (Redis)
3. Optimize images (already using Sharp)
4. Add lazy loading

---

### 5.4 Mobile Responsiveness Review (2 hours)

**Tasks:**
1. Test all pages on mobile
2. Fix layout issues
3. Improve touch targets
4. Test on real devices

---

### 5.5 SEO Optimization (2 hours)

**Tasks:**
1. Add meta tags
2. Add Open Graph tags
3. Add sitemap.xml
4. Add robots.txt
5. Improve page titles

---

## 📊 Timeline Summary

| Phase | Priority | Time | Status | Dependencies |
|-------|----------|------|--------|--------------|
| **1. Fix Build** | P0 | 5 min | ❌ | None |
| **2. Core Functionality** | P1 | 12-16 hrs | ❌ | Phase 1 |
| **3. Payment Integration** | P1 | 8-10 hrs | ❌ | Phase 1 |
| **4. Security & Polish** | P2 | 8-10 hrs | ❌ | Phase 1 |
| **5. Polish & Optimization** | P3 | 10-15 hrs | ❌ | Phase 1-4 |
| **TOTAL** | | **38-51 hrs** | | **~1 week** |

---

## 🎯 Minimum Viable Product (MVP)

**To launch with basic functionality:**
- ✅ Phase 1: Fix Build (5 min)
- ✅ Phase 2: Core Functionality (12-16 hrs)
- ✅ Phase 3.1-3.3: Payment Integration (7-9 hrs)
- ⚠️ Phase 4.1: Rate Limiting (2 hrs)
- ⚠️ Phase 4.5: Password Reset (3 hrs)

**Total MVP Time: 24-30 hours (~3-4 days)**

---

## 🚀 Launch Checklist

### Pre-Launch (Must Complete)
- [ ] Phase 1: Build fixed and deployed
- [ ] Phase 2.1: Real-time messaging working
- [ ] Phase 2.2: Photo uploads to cloud
- [ ] Phase 2.3: Critical flows tested
- [ ] Phase 3.1-3.3: Payment processing live
- [ ] Phase 4.1: Rate limiting active
- [ ] Phase 4.5: Password reset available
- [ ] All environment variables configured
- [ ] Database backups configured
- [ ] Error monitoring setup (Sentry)
- [ ] Domain configured and SSL active
- [ ] Terms of service & privacy policy added
- [ ] Support email configured
- [ ] Test accounts created for demo

### Post-Launch (Within 1 Week)
- [ ] Phase 3.4: Subscription management
- [ ] Phase 4.2: File upload security
- [ ] Phase 4.3: Profanity filter
- [ ] Phase 4.4: Error boundaries
- [ ] Monitor for errors and fix
- [ ] Gather user feedback
- [ ] Performance optimization if needed

### Future (1 Month+)
- [ ] Phase 5: All polish & optimization
- [ ] Mobile app (if needed)
- [ ] Advanced matching algorithm
- [ ] Video profiles
- [ ] Social media integration

---

## 📈 Success Metrics

### Week 1 Targets
- 50 user registrations
- 25 completed profiles
- 10 matches created
- 5 premium conversions
- < 5% error rate

### Month 1 Targets
- 500 users
- 250 active users (MAU)
- 50 matches
- ₹25,000 revenue
- 10% conversion rate

---

## 🎯 Recommended Immediate Actions

### TODAY (Next 2 Hours)
1. ✅ Fix 11 TypeScript errors (5 min)
2. ✅ Deploy to Vercel (10 min)
3. ✅ Fix pricing inconsistency (5 min)
4. ✅ Test live site end-to-end (30 min)
5. ✅ Document any new issues found (15 min)
6. 🎯 START Phase 2.1 (Real-time messaging)

### THIS WEEK
- Complete Phases 1-3
- Launch MVP
- Monitor and fix critical issues

### NEXT WEEK
- Complete Phase 4
- Gather user feedback
- Iterate based on feedback

---

*For detailed implementation guides, see accompanying documentation in DOCS/ folder*
