# Deployment Guide - Believers Matrimony

## Quick Deploy to Vercel (FREE)

### Step 1: Push Your Code to GitHub

Your code is already on GitHub. Make sure the latest changes are pushed:

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push -u origin claude/review-progress-live-site-011CV2EKFjiHuRTQVWMeRnUC
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Login" (you can use GitHub to login)
3. Click "Add New Project"
4. Import your repository: `tkevin55/believersmatrimony`
5. Vercel will auto-detect it's a Next.js project

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_xSpy2Rc9uUAq@ep-summer-sound-ahe2nama-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-here

NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Generate NEXTAUTH_SECRET:**
Run this in your terminal or use an online generator:
```bash
openssl rand -base64 32
```

#### Optional Variables (for full functionality):

```
# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SendGrid (optional - for emails)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@believersmatrimony.com

# Twilio (optional - for SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 4: Deploy!

1. Click "Deploy" button
2. Wait 2-3 minutes for deployment
3. Vercel will give you a live URL like: `https://believersmatrimony.vercel.app`

### Step 5: Set Up Database

After first deployment, you need to run Prisma migrations:

1. In Vercel dashboard, go to your project
2. Go to Settings → Functions
3. Or run locally:
```bash
npx prisma migrate deploy
```

## Updating Your Live Site

Every time you push to your branch, Vercel will automatically redeploy! Just:

```bash
git add .
git commit -m "Your update message"
git push
```

## Viewing on Phone

Once deployed:
1. Open the Vercel URL on your phone's browser
2. You can also add it to your home screen for app-like experience

## Troubleshooting

### Build Fails
- Check the Vercel build logs
- Ensure all environment variables are set
- Make sure DATABASE_URL is correct

### Database Connection Issues
- Verify the DATABASE_URL is copied correctly
- Check that Neon database is active
- Ensure SSL is enabled

### Pages Not Loading
- Clear your browser cache
- Check browser console for errors
- Verify NEXTAUTH_URL matches your Vercel URL

## Need Help?

Check Vercel deployment logs at:
`https://vercel.com/your-username/believersmatrimony/deployments`
