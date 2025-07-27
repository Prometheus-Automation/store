# ⚠️ IMPORTANT SECURITY NOTES

## Google Secret Manager Secrets

The following secrets are available in the `prometheus-ai-marketplace` project:

### Frontend Secrets (Safe to use in client-side code)
- **`VITE_SUPABASE_URL`** - The Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - The public anonymous key for Supabase

### Backend Secrets (NEVER use in frontend code!)
- **`SUPABASE_SERVICE_ROLE_KEY`** - ⚠️ **CRITICAL**: This is a service role key with full database access. **NEVER** expose this in frontend code, client-side JavaScript, or commit to git!

## Security Best Practices

### ✅ DO:
- Use `VITE_SUPABASE_URL` in your React app
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mapped to `VITE_SUPABASE_ANON_KEY`) in your React app
- Keep `.env.local` in `.gitignore`
- Use the fetch-secrets script to get values from Secret Manager
- Use Row Level Security (RLS) in Supabase for data protection

### ❌ DON'T:
- NEVER use `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- NEVER commit `.env.local` to git
- NEVER hardcode secrets in your code
- NEVER expose service keys in client-side code

## How to Fetch Secrets

1. List available secrets:
```bash
npm run list-secrets
```

2. Fetch frontend secrets:
```bash
npm run fetch-secrets
```

This will automatically update your `.env.local` with:
- `VITE_SUPABASE_URL` from Secret Manager
- `VITE_SUPABASE_ANON_KEY` from `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Environment Variables Mapping

| Secret Manager Name | Environment Variable | Usage |
|-------------------|---------------------|--------|
| VITE_SUPABASE_URL | VITE_SUPABASE_URL | Frontend - Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | VITE_SUPABASE_ANON_KEY | Frontend - Public anon key |
| SUPABASE_SERVICE_ROLE_KEY | ❌ NOT USED | Backend only - Full access |

## Quick Check

Run this to verify your setup:
```bash
# Check if secrets are properly loaded
cat .env.local | grep VITE_SUPABASE

# Should show:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

If you see placeholder values, run `npm run fetch-secrets` again.