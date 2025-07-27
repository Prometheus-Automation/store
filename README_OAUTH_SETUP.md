# OAuth Setup Instructions for AI Marketplace

## Overview
This guide helps you set up OAuth authentication with Google and GitHub for the AI Marketplace using Supabase and Google Cloud Secret Manager.

## Prerequisites
- Google Cloud Project: `prometheus-ai-marketplace`
- Supabase project created
- `gcloud` CLI installed and authenticated

## Step 1: Fetch Secrets from Google Secret Manager

The Supabase URL and Anon Key are stored in Google Secret Manager. To fetch them:

```bash
# Make sure you're in the project directory
cd "amazon like website"

# Run the fetch secrets script
npm run fetch-secrets
```

This script will:
1. Connect to Google Cloud project `prometheus-ai-marketplace`
2. Fetch `supabase-url` and `supabase-anon-key` from Secret Manager
3. Update your `.env.local` file automatically

## Step 2: Verify Configuration

Check that `.env.local` has been updated with real values:
```bash
# Should show actual URLs, not placeholders
cat .env.local | grep VITE_SUPABASE
```

## Step 3: Configure OAuth in Supabase Dashboard

### Google OAuth Setup
1. Go to your Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
4. Note the callback URL provided by Supabase

### GitHub OAuth Setup
1. In Supabase Dashboard > Authentication > Providers
2. Enable GitHub provider
3. Add your GitHub OAuth credentials:
   - Client ID: (from GitHub Developer Settings)
   - Client Secret: (from GitHub Developer Settings)
4. Note the callback URL provided by Supabase

## Step 4: Test OAuth Configuration

1. Start the development server:
```bash
npm run dev
```

2. Open the OAuth test page:
```bash
# Or navigate to: http://localhost:5173/test-oauth
npm run test-oauth
```

3. Test both Google and GitHub login buttons
4. Check for any error messages

## Step 5: Common Issues & Solutions

### Error: redirect_uri_mismatch
- Ensure the redirect URI in your OAuth provider EXACTLY matches Supabase
- For local testing: `http://localhost:5173/auth/callback`
- For production: `https://store.prometheusautomation.com/auth/callback`

### Error: Supabase URL not configured
- Run `npm run fetch-secrets` again
- Check that you have access to the Google Cloud project
- Verify secrets exist in Secret Manager

### Error: invalid_client
- Double-check Client ID and Secret in Supabase dashboard
- Ensure no extra spaces or line breaks
- Regenerate credentials if needed

## Step 6: Production Deployment

Before deploying to production:

1. **Remove test components:**
   - Delete `/src/components/OAuthTest.tsx`
   - Delete `/src/pages/TestOAuthPage.tsx`
   - Remove test route from `/src/router/AppRouter.tsx`

2. **Update redirect URLs:**
   - Add production URL to Google OAuth authorized redirects
   - Add production URL to GitHub OAuth authorized redirects
   - Update Supabase allowed redirect URLs

3. **Set production environment variables:**
   - Use Google Secret Manager for production secrets
   - Never commit `.env.local` to git

## Security Notes

- ✅ `.env.local` is gitignored - never commit it
- ✅ Use Google Secret Manager for all sensitive values
- ✅ Different credentials for dev/staging/production
- ✅ Regularly rotate OAuth client secrets
- ✅ Monitor OAuth usage in provider dashboards

## Need Help?

- Check Supabase logs: Dashboard > Logs > Auth
- Check browser console for detailed errors
- Verify all URLs match exactly (no trailing slashes)
- Ensure OAuth providers are properly configured