# Phase 1 Complete - Schema Updates

## ✅ Completed

### Database Schema Updates
1. **Removed:**
   - `BodyType` enum
   - `bodyType` field from Profile model
   - `complexion` field from Profile model
   - `ActivityType` enum
   - `Activity` model and all related relations
   - `city` field (replaced with `district`)

2. **Added:**
   - `MotherTongue` enum (20 Indian languages)
   - `PromptCategory` enum (5 categories)
   - `ChildrenPreference` enum (YES, NO, MAYBE, OPEN)
   - `HasChildrenStatus` enum (NO, YES_LIVING_WITH_ME, YES_NOT_LIVING_WITH_ME)
   - `motherTongue` field to Profile
   - `favoriteVerseReference` field to Profile
   - `favoriteVerseWhy` field to Profile
   - `hasChildren` field to Profile
   - `openToChildren` field to Profile
   - `wantChildrenFuture` field to Profile
   - `district` field to Profile (replacing city)
   - `Prompt` model with category, text, order
   - `PromptAnswer` model (users can answer up to 3 prompts)
   - `InterestOption` model (predefined interests with emoji + category)
   - `UserInterest` model (users can select up to 5 interests)

3. **Created:**
   - `/lib/indian-locations.ts` - Complete data for 36 Indian states/UTs and 700+ districts
   - Helper functions: `getDistrictsByState()`, `getAllStates()`

---

## 🔄 CRITICAL: Run Database Migration After Deploy

**You MUST run this command after deploying to update the database:**

```bash
npx prisma migrate dev --name phase1_schema_updates
```

or for production:

```bash
npx prisma migrate deploy
```

This will:
- Remove the deprecated columns
- Add new columns
- Create new tables for Prompts and Interests
- Update indexes

---

## 📋 Next Steps - Manual Updates Required

### Phase 2: Remove bodyType/complexion from Components (IN PROGRESS)

Files that need updating:
1. `components/onboarding-wizard.tsx` - Remove bodyType/complexion fields from step 5
2. `components/onboarding-form.tsx` - Remove if present
3. `app/profile/edit/page.tsx` - Remove bodyType/complexion fields
4. `app/profile/[userId]/page.tsx` - Don't display bodyType/complexion
5. `app/api/onboarding/route.ts` - Remove bodyType/complexion validation
6. `app/api/onboarding/complete/route.ts` - Remove from completion check
7. `app/api/profile/route.ts` - Remove from profile updates
8. `lib/matching.ts` - Remove from matching logic
9. `lib/utils.ts` - Remove any helper functions

### Phase 3: Add New Fields to UI

**Mother Tongue:**
- Add to onboarding step 5 (replace bodyType/complexion)
- Add to profile edit
- Show on profile display
- Add to partner preferences

**Favorite Bible Verse:**
- Add new section in onboarding (after faith testimony)
- Two fields: Reference + Why it matters (200 chars)
- Display prominently on profile

**Children Questions (3 separate questions):**
- Add to onboarding after family info
- Question 1: "Do you have children?" (NO | YES_LIVING_WITH_ME | YES_NOT_LIVING_WITH_ME)
- Question 2: "Are you open to someone with children?" (YES | NO | MAYBE)
- Question 3: "Do you want children in the future?" (YES | NO | MAYBE | OPEN)
- Show in partner preferences

**State → District Flow:**
- Step 1: Select State (dropdown)
- Step 2: Select District (dynamic dropdown based on state)
- Update onboarding location step
- Update profile edit
- Update search filters
- Use `getDistrictsByState()` helper

### Phase 4: Prompt System

**Database Seeding:**
Create seed script to populate Prompt table with all prompts from your specification

**UI Components:**
1. Create `components/prompt-selector.tsx` - Grid of prompts by category
2. Limit: User can select and answer up to 3 prompts
3. Each answer: max 250 characters
4. Add to onboarding (skippable step)
5. Show on profile as cards (like Hinge)

**API Routes:**
- `/api/prompts` - GET all prompts
- `/api/prompt-answers` - POST/PUT/DELETE user answers

### Phase 5: Interest System

**Database Seeding:**
Create seed script with all interests (with emojis + categories)

**UI Components:**
1. Create `components/interest-selector.tsx` - Grid with emoji pills
2. Limit: User can select up to 5 interests total
3. Show counter: "3 / 5 selected"
4. Add to onboarding (skippable step)
5. Show on profile and discover cards

**API Routes:**
- `/api/interests` - GET all interest options
- `/api/user-interests` - POST/PUT/DELETE user selections

### Phase 6: Discover Cards Updates

Update `components/profile-card.tsx` to show:
- Up to 3 interests (emoji + name)
- 1-2 prompt answers (question + answer preview)
- Location as "District, State" instead of just "City, State"

### Phase 7: Search Filters Update

Update `components/search/filter-sidebar.tsx`:
- Replace location text input with:
  - State dropdown
  - District dropdown (dynamic based on state)
- Remove any bodyType/complexion filters

### Phase 8: Premium Features

Update `app/premium/page.tsx`:
- Remove "Ad-free experience"
- Add "Monthly video profile"
- Add "Read receipts"
- Keep price at ₹799/month

**Blur Likes Feature:**
- Update likes page to blur profile photos for free users
- Show "Upgrade to Premium to see who liked you"
- Only show unblurred for premium users

### Phase 9: Onboarding Improvements

Make steps skippable:
- Only required: Name, Gender, DOB, State/District, Denomination, Email/Phone
- Optional: Prompts, Interests, Partner Preferences, Photos (can skip, add later)
- Add "Skip" button to optional steps
- Save progress automatically
- Allow resuming from where they left off
- Add profile completion percentage prompt after onboarding

---

## 🗄️ Seed Data Scripts Needed

1. **Prompts Seed Script** - Insert ~50 prompts across 5 categories
2. **Interests Seed Script** - Insert ~50 interests across 9 categories
3. **Update existing profile seeds** - Use district instead of city

---

## 🚫 Remove Activity Tracking

Delete or comment out:
- `/app/activity/*` pages/components
- Any activity-related API routes
- Activity display in navigation

---

## ⚠️ Testing Checklist After Deployment

- [ ] Run Prisma migration successfully
- [ ] Onboarding flow works without bodyType/complexion
- [ ] Profile edit works without bodyType/complexion
- [ ] Search filters work with new state/district dropdowns
- [ ] Mother tongue displays correctly
- [ ] Bible verse section works
- [ ] Children questions work
- [ ] Prompts system functional (select, save, display)
- [ ] Interests system functional (select, save, display)
- [ ] Discover cards show interests + prompts
- [ ] Premium features updated
- [ ] Likes blur works for free users
- [ ] Profile completion prompts appear

---

**Files Modified So Far:**
- `prisma/schema.prisma` ✅
- `lib/indian-locations.ts` ✅ (created)
- `app/discover/page.tsx` ✅ (fixed toast import)

**Committed to:** `claude/review-progress-live-site-011CV2EKFjiHuRTQVWMeRnUC`
