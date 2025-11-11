# Seed Test Data - 50 Profiles

This guide will help you populate your database with 50 test profiles (25 male + 25 female) to test matching, search, and messaging features.

## 🎭 Test Accounts

I've created 2 specific accounts you can use to test all features:

### Male Account
- **Email**: `john.test@demo.com`
- **Password**: `Test@123`
- **Profile**: 28-year-old Software Engineer from Bangalore

### Female Account
- **Email**: `sarah.test@demo.com`
- **Password**: `Test@123`
- **Profile**: 26-year-old Marketing Manager from Bangalore

## 🌱 How to Seed the Database

You have 2 options:

### Option 1: Run Locally (Recommended)

1. Make sure you have the `DATABASE_URL` in your `.env` file:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_xSpy2Rc9uUAq@ep-summer-sound-ahe2nama-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

2. Run the seed script:
```bash
npm run seed:test
```

3. Wait 1-2 minutes for all 50 profiles to be created

### Option 2: Run in Vercel Console

If you can't run locally, you can run it via Vercel:

1. Go to your Vercel project dashboard
2. Click on **"Settings"** → **"Environment Variables"**
3. Verify `DATABASE_URL` is set
4. Run the seed command through Vercel CLI or create a temporary API route

## 📊 What Gets Created

- **2 Test Accounts**: john.test@demo.com & sarah.test@demo.com
- **48 Random Profiles**: 24 male + 24 female
- **Total**: 50 profiles with complete information

### Profile Details Include:
- ✅ Complete personal information (age, location, height, etc.)
- ✅ Faith background (denomination, church, testimony)
- ✅ Education & career details
- ✅ Family background
- ✅ Lifestyle preferences
- ✅ Partner preferences
- ✅ Photos (placeholder images)
- ✅ 100% profile completion

## 🧪 Testing Features

Once seeded, you can test:

### 1. Login as Male User
```
Email: john.test@demo.com
Password: Test@123
```

**Test these features:**
- Browse profiles in Discover (swipe cards)
- Search with filters
- Like/Pass profiles
- Send interests
- Match with someone
- Send messages

### 2. Login as Female User
```
Email: sarah.test@demo.com
Password: Test@123
```

**Test these features:**
- Receive likes/interests
- Match with someone
- Chat functionality
- Profile visibility settings

### 3. Cross-Account Testing

You can login to both accounts (in different browsers or incognito) to:
- Have John like Sarah's profile
- Have Sarah like John's profile back
- Create a match
- Test messaging between them
- Test notifications

## 🗑️ Clean Up (Optional)

If you want to remove all test data later:

```sql
-- Run this in Neon SQL Editor
DELETE FROM "User" WHERE email LIKE '%@example.com' OR email LIKE '%@demo.com';
```

## ⚠️ Notes

- All test profiles have the same password: `Test@123`
- Photos are placeholder images (1x1 pixel)
- Profiles have realistic Indian names and locations
- Ages range from 22-40 years
- All profiles are marked as onboarding completed
- Partner preferences are set for realistic matching

## 🚀 After Seeding

Go to your live site and:
1. Login with `john.test@demo.com` / `Test@123`
2. Go to `/discover` to see all the profiles
3. Start swiping and testing!

Enjoy testing your matrimony platform! 🎉
