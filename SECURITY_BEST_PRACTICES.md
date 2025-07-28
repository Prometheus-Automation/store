# 🔐 Security Best Practices - AI Marketplace

## ✅ Supabase Security Configuration

### **What We Use (Secure Approach)**
- **Client-side:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` only
- **Security:** Row Level Security (RLS) policies on all tables
- **Result:** Users can only access data they're authorized to see

### **What We DON'T Use (Avoiding Tea App Vulnerability)**
- ❌ **No Service Role Key in client code**
- ❌ **No bypassing RLS policies**
- ❌ **No admin operations from frontend**

## 🛡️ Row Level Security (RLS) Implementation

Your database is protected with comprehensive RLS policies:

```sql
-- Example: Users can only see their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Example: Only authenticated users can create models
CREATE POLICY "Authenticated users can create models" ON public.ai_models
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

## 🔑 Environment Variables Security

### **Public Variables (Safe to Expose)**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅
- `NEXT_PUBLIC_APP_URL` ✅

### **Secret Variables (Never Expose)**
- `STRIPE_SECRET_KEY` ⚠️
- `CSRF_SECRET` ⚠️
- `CRON_SECRET` ⚠️
- Redis tokens ⚠️

## 🚀 Additional Security Measures

### **1. CSRF Protection**
- All API routes validate CSRF tokens
- Timing-safe comparison prevents timing attacks
- Tokens expire and rotate automatically

### **2. Rate Limiting**
- Upstash Redis for distributed rate limiting
- Per-user and per-IP limits
- Exponential backoff for repeated violations

### **3. Input Validation**
- Zod schemas validate all user input
- SQL injection prevention via parameterized queries
- XSS protection through React's built-in escaping

### **4. Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## 📋 Security Checklist

- [x] RLS policies on all tables
- [x] Anon key only (no service role in client)
- [x] CSRF tokens on state-changing operations
- [x] Rate limiting on all API endpoints
- [x] Input validation with Zod
- [x] Security headers configured
- [x] Environment variables properly separated
- [x] No secrets in client-side code

## 🚨 Common Mistakes to Avoid

1. **Using Service Role Key in Frontend**
   ```javascript
   // ❌ NEVER DO THIS
   const supabase = createClient(url, SERVICE_ROLE_KEY)
   
   // ✅ ALWAYS DO THIS
   const supabase = createClient(url, ANON_KEY)
   ```

2. **Disabling RLS**
   ```sql
   -- ❌ NEVER DO THIS
   ALTER TABLE products DISABLE ROW LEVEL SECURITY;
   
   -- ✅ ALWAYS DO THIS
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ```

3. **Exposing Sensitive Operations**
   ```javascript
   // ❌ NEVER DO THIS
   // Client-side admin operations
   await supabase.auth.admin.deleteUser(userId)
   
   // ✅ ALWAYS DO THIS
   // Server-side API route with proper auth
   await fetch('/api/admin/delete-user', { ... })
   ```

## 🔍 Security Monitoring

1. **Monitor Failed Auth Attempts**
   - Track in Supabase dashboard
   - Alert on suspicious patterns

2. **Review RLS Policy Usage**
   - Check Supabase logs
   - Ensure policies aren't bypassed

3. **Audit API Usage**
   - Monitor rate limit hits
   - Track unusual request patterns

## 💡 Key Takeaway

**Your app is secure because:**
- Only the anon key is used client-side
- RLS policies enforce data access rules
- No service role key exposure risk
- Multiple layers of security protection

This approach prevents Tea App-style vulnerabilities where service role keys were exposed, giving attackers full database access.