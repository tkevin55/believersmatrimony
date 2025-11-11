# 📁 Project Structure Overview

**Believers Matrimony - Christian Matrimonial Platform**

---

## 🎯 Project Overview

**Type:** Christian Matrimonial Web Application
**Framework:** Next.js 14 (App Router)
**Language:** TypeScript
**Database:** PostgreSQL via Prisma ORM
**Deployment:** Vercel
**Purpose:** Faith-based matchmaking platform for Christian believers in India

---

## 🗂️ Directory Structure

```
believers-matrimony/
├── app/                          # Next.js 14 App Router
│   ├── (pages)/                  # Frontend pages
│   │   ├── page.tsx             # Landing/home page
│   │   ├── layout.tsx           # Root layout
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── auth/                # Authentication pages
│   │   ├── dashboard/           # User dashboard
│   │   ├── discover/            # Browse/discovery feed
│   │   ├── likes/               # Likes received (premium paywall)
│   │   ├── messages/            # Messaging inbox
│   │   ├── onboarding/          # Multi-step onboarding wizard
│   │   ├── premium/             # Premium subscription page
│   │   ├── preferences/         # Partner preferences
│   │   ├── profile/             # Profile viewing & editing
│   │   ├── search/              # Advanced search
│   │   └── ...                  # Other pages
│   │
│   └── api/                      # Backend API routes
│       ├── admin/               # Admin management APIs
│       ├── auth/                # Authentication (Next-Auth)
│       ├── onboarding/          # Onboarding flow
│       ├── profile/             # Profile CRUD
│       ├── discover/            # Curated matches
│       ├── search/              # Search & filters
│       ├── likes/               # Like/super-like
│       ├── interests/           # Interest requests
│       ├── matches/             # Match management
│       ├── messages/            # Messaging
│       ├── subscription/        # Premium subscriptions
│       ├── verification/        # Verification system
│       ├── notifications/       # Notifications
│       ├── block/               # Blocking users
│       ├── report/              # Reporting users
│       └── ...                  # Other APIs
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components (24 files)
│   ├── dashboard/               # Dashboard-specific components
│   ├── search/                  # Search page components
│   ├── admin/                   # Admin panel components
│   ├── onboarding-wizard.tsx   # Main onboarding component (1857 lines!)
│   ├── profile-card.tsx        # User profile card
│   ├── interest-card.tsx       # Interest notification card
│   ├── conversation-list.tsx   # Message inbox list
│   ├── message-bubble.tsx      # Chat message bubble
│   ├── header.tsx              # Main navigation header
│   ├── mobile-nav.tsx          # Mobile navigation
│   └── ...                     # 55 total components
│
├── lib/                          # Utility libraries
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # Next-Auth configuration
│   ├── utils.ts                # General utilities
│   ├── matching.ts             # Match algorithm
│   ├── quotas.ts               # Premium quota enforcement
│   ├── admin.ts                # Admin authorization
│   ├── email.ts                # SendGrid email service
│   ├── sms.ts                  # Twilio SMS service
│   ├── socket.ts               # Socket.IO client
│   ├── notifications.ts        # Notification system
│   ├── profanity.ts            # Profanity filter (not active)
│   └── indian-locations.ts     # States & districts data
│
├── prisma/                       # Database
│   ├── schema.prisma           # Database schema (22 models)
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Database seeding
│
├── scripts/                      # Utility scripts
│   ├── seed-prompts.ts         # Seed profile prompts
│   ├── seed-interests.ts       # Seed interest options
│   ├── seed-profiles.ts        # Generate test profiles
│   └── seed-50-profiles.ts     # Quick profile generation
│
├── hooks/                        # Custom React hooks
│   └── use-toast.ts            # Toast notification hook
│
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts          # Next-Auth type extensions
│
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── images/
│   └── ...
│
├── server.ts                     # Socket.IO server (NOT RUNNING)
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS config
├── next.config.js               # Next.js config
├── .env                         # Environment variables
└── README.md                    # Project readme

```

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.33 | React framework with App Router |
| React | 18.3.0 | UI library |
| TypeScript | 5.3.3 | Type safety |
| Tailwind CSS | 3.4.0 | Utility-first CSS framework |
| shadcn/ui | Latest | Radix UI-based component library |
| Framer Motion | 11.0.0 | Animations |
| Lucide React | 0.303.0 | Icon library |
| React Hook Form | 7.49.0 | Form management |
| Zod | 3.22.4 | Schema validation |
| React Dropzone | 14.2.3 | File uploads |
| date-fns | 3.0.0 | Date utilities |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.2.33 | RESTful API endpoints |
| Next-Auth | 4.24.5 | Authentication & sessions |
| Prisma | 5.20.0 | Database ORM |
| PostgreSQL | - | Relational database |
| bcryptjs | 2.4.3 | Password hashing |
| Socket.IO | 4.7.2 | WebSocket (configured, not running) |

### **Third-Party Services**
| Service | Purpose | Status |
|---------|---------|--------|
| SendGrid | Email delivery | ✅ Configured |
| Twilio | SMS verification | ⚠️ Configured, not tested |
| Cloudinary | Image storage | ⚠️ Configured, not active |
| Razorpay/Stripe | Payments | ❌ Not configured |

### **Development Tools**
- ESLint (Next.js config)
- Autoprefixer
- PostCSS
- Sharp (image optimization)

---

## 📦 Key Dependencies

### **Critical Dependencies**
```json
{
  "@prisma/client": "^5.20.0",           // Database ORM
  "next": "^14.2.0",                      // Framework
  "next-auth": "^4.24.5",                 // Authentication
  "react": "^18.3.0",                     // UI library
  "zod": "^3.22.4",                       // Validation
  "bcryptjs": "^2.4.3",                   // Security
  "@sendgrid/mail": "^8.1.0",             // Email
  "twilio": "^4.20.0",                    // SMS
  "cloudinary": "^1.41.0",                // Cloud storage
  "socket.io": "^4.7.2",                  // Real-time
  "socket.io-client": "^4.7.2"            // WebSocket client
}
```

### **UI Component Libraries**
```json
{
  "@radix-ui/react-*": "Latest",          // 12 Radix UI primitives
  "tailwind-merge": "^2.2.0",             // Class merging
  "class-variance-authority": "^0.7.0",   // Component variants
  "tailwindcss-animate": "^1.0.7"         // Animations
}
```

---

## 🗄️ Database Schema Overview

**Total Models:** 22
**Total Fields:** ~250+
**Migration Status:** ✅ Up-to-date (latest: district/motherTongue/favoriteVerse)

### **Core Models**
1. **User** - Authentication & basic info
2. **Profile** - Extended profile data
3. **Photo** - User photos
4. **PartnerPreferences** - Match preferences
5. **Subscription** - Premium tiers

### **Interaction Models**
6. **Interest** - Interest requests
7. **Match** - Mutual matches
8. **Message** - Chat messages
9. **Like** - Likes & super likes
10. **Block** - Blocked users
11. **Report** - User reports

### **Feature Models**
12. **Prompt** - Profile prompts
13. **PromptAnswer** - User prompt answers
14. **InterestOption** - Interest categories
15. **UserInterest** - User selected interests
16. **Notification** - User notifications
17. **DailyQuota** - Usage quotas

### **Verification Models**
18. **Verification** - Photo/email verification
19. **ChurchVerification** - Pastor verification
20. **SuperLikeQuota** - Super like limits

### **Admin/System Models**
21. **Account** - OAuth accounts (Next-Auth)
22. **Session** - User sessions (Next-Auth)
23. **VerificationToken** - Next-Auth tokens

---

## 🌐 API Routes Map

**Total API Endpoints:** 46 routes

### **Authentication** (3 routes)
- `POST /api/register` - User registration
- `POST /api/auth/[...nextauth]` - Next-Auth handler
- `POST /api/auth/change-password` - Password change

### **Onboarding** (3 routes)
- `POST /api/onboarding/complete` - Complete onboarding
- `PATCH /api/onboarding/progress` - Save progress per step
- `GET /api/onboarding/progress` - Load saved progress

### **Profile** (4 routes)
- `GET /api/profile/[userId]` - Get profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/route` - Get own profile
- `POST /api/profile/photos` - Upload photos

### **Discovery & Search** (2 routes)
- `GET /api/discover` - Curated matches
- `GET /api/search` - Advanced search

### **Interactions** (6 routes)
- `POST /api/likes` - Like/super-like user
- `GET /api/likes` - Get received likes
- `POST /api/interests` - Send interest
- `GET /api/interests` - Get interests
- `PUT /api/interests/[id]` - Accept/decline interest
- `GET /api/matches` - Get matches

### **Messaging** (3 routes)
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- `GET /api/messages/[matchId]` - Get conversation messages

### **Premium** (4 routes)
- `GET /api/subscription` - Get subscription status
- `POST /api/subscription/upgrade` - Upgrade tier (STUBBED)
- `GET /api/quotas` - Get remaining quotas
- `GET /api/super-likes` - Get super like quota

### **Verification** (3 routes)
- `POST /api/verification` - Request verification
- `POST /api/verification/church` - Request church verification
- `POST /api/verification/church/verify` - Verify church (pastor side)

### **User Actions** (5 routes)
- `POST /api/block` - Block user
- `GET /api/block` - Get blocked users
- `POST /api/report` - Report user
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications` - Mark as read

### **Settings** (4 routes)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `PUT /api/settings/privacy` - Update privacy
- `PUT /api/settings/notifications` - Update notification prefs

### **Prompts & Interests** (3 routes)
- `GET /api/prompts` - Get available prompts
- `POST /api/prompt-answers` - Save prompt answers
- `POST /api/user-interests` - Save selected interests

### **Admin** (9 routes)
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/users/[userId]` - User details
- `PUT /api/admin/users/[userId]` - Update user (suspend/ban)
- `GET /api/admin/verifications` - Photo verifications
- `PUT /api/admin/verifications` - Approve/reject verification
- `GET /api/admin/reports` - User reports
- `PUT /api/admin/reports/[reportId]` - Review report
- `GET /api/stats` - Global stats

### **Utility** (2 routes)
- `POST /api/seed-test-data` - Generate test data
- `GET /api/preferences` - Get partner preferences

---

## 📄 Pages & Routes

**Total Pages:** 21 user-facing pages + 5 admin pages = **26 pages**

### **Public Pages**
- `/` - Landing page
- `/auth/login` - Sign in
- `/auth/register` - Sign up
- `/auth/change-password` - Password change
- `/guidelines` - Community guidelines
- `/safety` - Safety tips

### **Onboarding**
- `/onboarding` - 8-step wizard

### **Main App**
- `/dashboard` - User dashboard
- `/discover` - Browse feed (main feature)
- `/search` - Advanced search with filters
- `/likes` - See who liked you (premium paywall)
- `/preferences` - Partner preferences
- `/premium` - Subscription plans

### **Profile**
- `/profile/[userId]` - View profile
- `/profile/edit` - Edit own profile
- `/profile/settings` - Account settings

### **Messaging**
- `/messages` - Inbox
- `/messages/[matchId]` - Chat conversation

### **Verification**
- `/verify/church/[token]` - Pastor verification page

### **Admin Panel**
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/users/[userId]` - User detail
- `/admin/verifications` - Photo verifications
- `/admin/reports` - User reports

### **Utility**
- `/seed-database` - Test data generation page

---

## 🧩 Component Architecture

**Total Components:** 55 files

### **Component Breakdown**

#### **UI Components (24 files)** - shadcn/ui library
- Form controls: `input.tsx`, `textarea.tsx`, `checkbox.tsx`, `select.tsx`, `switch.tsx`, `slider.tsx`, `dual-range-slider.tsx`
- Layout: `card.tsx`, `sheet.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `dropdown-menu.tsx`, `tabs.tsx`, `table.tsx`
- Feedback: `toast.tsx`, `toaster.tsx`, `progress.tsx`, `badge.tsx`
- Display: `avatar.tsx`, `label.tsx`, `button.tsx`
- Hooks: `use-toast.ts`

#### **Dashboard Components (5 files)**
- `overview-tab.tsx` - Dashboard home with stats
- `matches-tab.tsx` - Matches list
- `interests-tab.tsx` - Sent/received interests
- `activity-tab.tsx` - Activity history
- `church-verification-card.tsx` - Verification status card

#### **Search Components (3 files)**
- `search-results.tsx` - Search results grid
- `profile-card-compact.tsx` - Compact profile card
- `filter-sidebar.tsx` - Search filters

#### **Admin Components (4 files)**
- `stats-card.tsx` - Metric card
- `sidebar.tsx` - Admin navigation
- `users-table.tsx` - User list table
- `report-review.tsx` - Report review UI

#### **Feature Components (19 files)**
- `onboarding-wizard.tsx` (1857 lines!) - Main onboarding flow
- `onboarding-form.tsx` - Legacy onboarding
- `profile-card.tsx` - Full profile card
- `interest-card.tsx` - Interest notification
- `conversation-list.tsx` - Message inbox
- `message-bubble.tsx` - Chat bubble
- `message-input.tsx` - Chat input
- `typing-indicator.tsx` - Typing animation
- `photo-upload.tsx` - Photo uploader
- `interest-selector.tsx` - Interest picker
- `prompt-selector.tsx` - Prompt picker
- `match-modal.tsx` - Match notification
- `send-interest-dialog.tsx` - Interest dialog
- `block-dialog.tsx` - Block user dialog
- `report-dialog.tsx` - Report user dialog
- `blocked-users.tsx` - Blocked users list
- `profile-completion.tsx` - Completion percentage
- `notifications-dropdown.tsx` - Notification bell
- `header.tsx` - Main navigation
- `mobile-nav.tsx` - Mobile menu
- `auth-provider.tsx` - NextAuth wrapper

---

## 🔧 Configuration Files

### **Next.js Configuration**
- `next.config.js` - Next.js settings
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS setup

### **Package Management**
- `package.json` - Dependencies & scripts
- `package-lock.json` - Dependency lock file

### **Environment**
- `.env` - Environment variables (not in repo)
- `.env.example` - Example environment file

### **Git**
- `.gitignore` - Ignored files
- `.eslintrc.json` - ESLint rules

---

## 📊 Codebase Statistics

### **File Counts**
- TypeScript files: 123 files
- React components: 55 files
- API routes: 46 files
- Pages: 26 files
- Utility files: 10 files
- Database models: 22 models

### **Lines of Code (Estimated)**
- Components: ~8,000 lines
- API routes: ~5,000 lines
- Pages: ~3,000 lines
- Libraries: ~2,000 lines
- Database schema: ~650 lines
- **Total: ~18,000 lines of TypeScript/TSX**

### **Largest Files**
1. `components/onboarding-wizard.tsx` - 1,857 lines
2. `app/api/onboarding/complete/route.ts` - 346 lines
3. `prisma/schema.prisma` - 652 lines
4. `lib/indian-locations.ts` - ~500 lines (data)
5. `components/profile-card.tsx` - ~400 lines

---

## 🔐 Security Architecture

### **Authentication**
- **Provider:** Next-Auth v4
- **Strategy:** Credentials-based (email/password)
- **Session:** JWT tokens
- **Password:** bcrypt hashing

### **Authorization**
- Role-based (USER, ADMIN, MODERATOR)
- Admin routes protected via `requireAdmin()` middleware
- API routes check session authentication

### **Data Protection**
- Environment variables for secrets
- SQL injection protection via Prisma
- XSS protection via React
- CSRF protection via Next.js

### **Privacy**
- Profile visibility controls
- Block/report system
- Data stored in PostgreSQL

---

## 🚀 Build & Deployment

### **Build Commands**
```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint
```

### **Database Commands**
```bash
npx prisma generate  # Generate Prisma client
npx prisma migrate deploy  # Run migrations
npx prisma studio    # Database GUI
```

### **Seed Commands**
```bash
npm run seed:profiles     # Generate profiles
npm run seed:test         # Generate 50 test profiles
npx ts-node scripts/seed-prompts.ts    # Seed prompts
npx ts-node scripts/seed-interests.ts  # Seed interests
```

### **Deployment**
- **Platform:** Vercel
- **Branch:** `claude/review-progress-live-site-011CV2EKFjiHuRTQVWMeRnUC`
- **Build Command:** `npx prisma generate && npx prisma migrate deploy && next build`
- **Install Command:** `npm install`

---

## 📝 Notable Implementation Details

### **1. Onboarding Wizard**
- 8-step multi-page form
- Saves progress per step
- Skippable with resume functionality
- Validates each step before proceeding
- Handles photo uploads (up to 8 photos)
- 1,857 lines - largest component

### **2. Matching Algorithm**
(`lib/matching.ts`)
- Calculates match percentage based on:
  - Denomination compatibility (30%)
  - Location proximity (20%)
  - Age difference (15%)
  - Height preference (10%)
  - Education level (10%)
  - Church involvement (10%)
  - Lifestyle (drinking/smoking) (5%)

### **3. Quota System**
(`lib/quotas.ts`)
- Enforces free tier limits
- Tracks daily/weekly usage
- Integrates with subscription tiers
- Returns 429 status when quota exceeded

### **4. Indian Locations**
(`lib/indian-locations.ts`)
- 37 states/territories
- 640+ districts
- Hierarchical state → district selection

### **5. Profanity Filter**
(`lib/profanity.ts`)
- Basic word list filtering
- ⚠️ **Not currently integrated**

---

## 🔄 Data Flow

### **User Registration Flow**
```
POST /api/register
  → Create User (email, password)
  → Send verification email (SendGrid)
  → Redirect to /onboarding
```

### **Onboarding Flow**
```
/onboarding page
  → OnboardingWizard component
  → 8 steps with validation
  → PATCH /api/onboarding/progress (per step)
  → POST /api/onboarding/complete (final)
  → Create Profile, Photos, PartnerPreferences
  → Redirect to /discover
```

### **Discovery Flow**
```
GET /api/discover
  → Fetch user profile
  → Exclude blocked users
  → Get curated matches (lib/matching.ts)
  → Calculate match percentages
  → Fetch interests & prompts
  → Return formatted profiles
```

### **Like → Match → Message Flow**
```
POST /api/likes (User A likes User B)
  → Check quota
  → Create Like record
  → Check if User B liked User A
  → If yes: Create Match
  → Create notification
  → Return match status

If matched:
GET /api/messages
  → Show new match in inbox
  → Click to open conversation

POST /api/messages
  → Send message
  → Notification created
  → (Socket.IO would emit here if running)
```

---

## ⚠️ Known Issues & Limitations

### **Build Issues**
- ❌ TypeScript compilation errors (11 errors)
- Prevents deployment

### **Missing Integrations**
- ❌ Socket.IO server not running (real-time messaging broken)
- ❌ Cloudinary not configured (photos stored as base64)
- ❌ Payment gateway not integrated

### **Incomplete Features**
- ⚠️ Profile edit page partially implemented
- ⚠️ Email verification flow not tested
- ⚠️ Church verification flow not tested
- ⚠️ Password reset missing

---

## 📚 Related Documentation

- `features-implemented.md` - Feature audit
- `database-schema.md` - Database documentation
- `api-routes.md` - API endpoint documentation
- `bugs-and-errors.md` - Known issues
- `payment-integration.md` - Payment system details

---

*Last Updated: November 11, 2025*
