# Database Setup Guide

Your Believers Matrimony site is live, but you need to set up the database tables. Here are three easy methods:

## 🎯 Method 1: Using Neon SQL Editor (EASIEST - Recommended)

1. **Go to your Neon Dashboard**: https://console.neon.tech
2. **Select your database** (`neondb`)
3. **Click "SQL Editor"** in the left sidebar
4. **Paste and run this command**:

```sql
-- This will create the initial migration
-- Prisma will handle the schema sync
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

5. **Then go back to Vercel** and run the migration:
   - Go to your Vercel project
   - Click **"Settings"** → **"Functions"**
   - Or use method 2 below

## 🚀 Method 2: Using Vercel CLI (Easy)

If you have Vercel CLI installed:

```bash
vercel env pull .env.local
npm install
npx prisma migrate deploy
```

## 🛠 Method 3: Manual SQL Migration

If the above methods don't work, I can help you generate a complete SQL script to run in Neon's SQL Editor.

---

## ✅ How to Verify Setup Worked

After running the migration, go to your site:
https://believersmatrimony-2wbvbh5so-kevins-projects-07eab318.vercel.app/auth/register

Try to **register a new account**. If it works without errors, your database is set up correctly!

---

## 🎭 Want Test Data?

After database setup, I can create test user accounts so you can:
- See how profiles look
- Test matching features
- Try messaging
- Explore all features

Let me know if you need help with any step!
