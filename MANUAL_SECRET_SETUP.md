# Manual Secret Setup Instructions

Since the automated script requires gcloud authentication, please follow these steps manually:

## Option 1: Using gcloud CLI (Recommended)

1. **Authenticate with gcloud:**
```bash
gcloud auth login
```

2. **Switch to the correct project:**
```bash
gcloud config set project prometheus-ai-marketplace
```

3. **Fetch the secrets manually:**
```bash
# Get Supabase URL
gcloud secrets versions access latest --secret="VITE_SUPABASE_URL"

# Get Supabase Anon Key
gcloud secrets versions access latest --secret="NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

4. **Update .env.local manually:**
Replace the placeholder values in `.env.local`:
- Replace `your-actual-url-from-secret-manager` with the actual Supabase URL
- Replace `your-actual-anon-key-from-secret-manager` with the actual anon key

## Option 2: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `prometheus-ai-marketplace`
3. Navigate to Security → Secret Manager
4. Click on each secret to view the value:
   - `VITE_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the values and update `.env.local`

## Option 3: Manual Values for Testing

If you have the Supabase project details, update `.env.local` directly:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
```

## Verify Setup

After updating `.env.local`, verify the values are loaded:

1. **Check the file:**
```bash
cat .env.local | grep VITE_SUPABASE
```

2. **Start the dev server:**
```bash
npm run dev
```

3. **Test OAuth:**
Navigate to http://localhost:5173/test-oauth

The OAuth test page will show:
- ✅ Green checkmarks if credentials are configured
- ❌ Red X if still using placeholders

## Troubleshooting

If you see "Supabase not configured" warnings:
1. Double-check the values in `.env.local`
2. Make sure there are no quotes around the values
3. Restart the dev server after updating `.env.local`

## Security Reminder

- Never commit `.env.local` to git
- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be used in frontend code
- Only use the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the browser