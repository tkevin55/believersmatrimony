# Deployment Scripts

Automated scripts for deploying and monitoring Vercel deployments.

## 🚀 Quick Start

### Automated Deploy + Monitor (Recommended)

Deploy your changes and automatically monitor the deployment status:

```bash
./scripts/deploy-and-monitor.sh "Your commit message here"
```

**What it does:**
1. ✅ Shows current git status
2. ✅ Stages all changes (`git add -A`)
3. ✅ Creates commit with your message
4. ✅ Pushes to remote (with retry on network errors)
5. ✅ Monitors Vercel deployment status
6. ✅ Shows success/failure with deployment URL

**Example:**
```bash
./scripts/deploy-and-monitor.sh "fix: resolve P1002 advisory lock timeout"
```

### Manual Monitoring

If you've already pushed code and just want to monitor the deployment:

```bash
node scripts/check-vercel-status.js
```

## 📋 Available Scripts

### 1. `deploy-and-monitor.sh`
**Full automated workflow** - Commit, push, and monitor deployment

**Usage:**
```bash
./scripts/deploy-and-monitor.sh "commit message"
```

**Features:**
- Automatic git add, commit, push
- Retry logic for network failures (4 attempts with exponential backoff)
- Real-time deployment monitoring
- Success/failure notifications

### 2. `check-vercel-status.js`
**Deployment monitor** - Check status of current commit's deployment

**Usage:**
```bash
node scripts/check-vercel-status.js
```

**Features:**
- Monitors deployment status via GitHub API
- Updates every 15 seconds
- 10-minute timeout
- Shows deployment URL when complete
- Error diagnosis and fix suggestions

### 3. `apply-migration.js`
**Database migration** - Runs during Vercel build (automatic)

**Purpose:**
Bypasses Prisma's advisory lock mechanism for Neon compatibility

**Called by:** `package.json` build script (automatic)

## 🔄 Typical Workflow

### Option 1: Fully Automated (Recommended)
```bash
# Make your code changes...

# Deploy and monitor in one command
./scripts/deploy-and-monitor.sh "feat: add new feature"

# Script will:
# - Commit your changes
# - Push to GitHub
# - Monitor Vercel deployment
# - Show you the live URL when ready ✅
```

### Option 2: Manual Control
```bash
# Make your code changes...

# Standard git workflow
git add -A
git commit -m "feat: add new feature"
git push -u origin <branch-name>

# Then monitor deployment
node scripts/check-vercel-status.js
```

## 📊 Deployment Status Messages

### ✅ Success
```
✅ DEPLOYMENT SUCCEEDED!
🎉 Your app is live!
🔗 View deployment: https://...
```

### ❌ Failure
```
❌ DEPLOYMENT FAILED
📋 Check logs at: https://...

💡 Common issues:
   1. Database migration errors → Check DATABASE_URL
   2. Build errors → Check package.json build script
   3. Runtime errors → Check Vercel function logs
```

### ⏳ In Progress
```
⏳ Deployment in progress... (45s elapsed)
```

## 🐛 Troubleshooting

### Deployment Timeout
If deployment takes >10 minutes, the script will timeout. Check manually at:
```
https://vercel.com/tkevin55/believersmatrimony/deployments
```

### Network Errors During Push
The script automatically retries up to 4 times with exponential backoff:
- 1st retry: 2s delay
- 2nd retry: 4s delay
- 3rd retry: 8s delay
- 4th retry: 16s delay

### P1002 Advisory Lock Error
If you see P1002 errors in Vercel logs:
1. Check that `pg` package is in `dependencies` (not devDependencies)
2. Verify `apply-migration.js` script exists
3. Confirm build command: `node scripts/apply-migration.js && next build`

### Migration Already Applied
The migration script is idempotent - safe to run multiple times. It checks if migration exists before applying.

## 🔧 Configuration

### Customize Timeouts

Edit `scripts/check-vercel-status.js`:
```javascript
const CHECK_INTERVAL = 15000  // Check every 15s
const MAX_WAIT = 600000       // Timeout after 10 minutes
```

### Customize Retry Logic

Edit `scripts/deploy-and-monitor.sh`:
```bash
MAX_RETRIES=4        # Number of push retries
RETRY_DELAY=2        # Initial delay (doubles each retry)
```

## 📦 Dependencies

- **Node.js** - For JavaScript scripts
- **Git** - For version control
- **Bash** - For shell scripts (Unix/Linux/macOS)

No external packages required - uses only Node.js built-ins.

## 🎯 Benefits

**Before (Manual):**
```bash
git add -A
git commit -m "fix"
git push
# Wait... refresh Vercel dashboard...
# Check logs... copy error...
# Paste error to Claude...
# Wait for fix...
# Repeat
```

**After (Automated):**
```bash
./scripts/deploy-and-monitor.sh "fix"
# ✅ Automatic monitoring
# ✅ Immediate error display
# ✅ Fix suggestions
# ✅ Live URL when ready
```

## 📝 Notes

- Scripts are safe to run multiple times
- Migration script is idempotent (won't duplicate data)
- All scripts have proper error handling
- Network failures are automatically retried
- Status checks don't consume Vercel build minutes

## 🚨 Emergency Manual Check

If scripts fail, always fallback to:
```
https://vercel.com/tkevin55/believersmatrimony/deployments
```
