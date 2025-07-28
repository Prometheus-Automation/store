# 🚨 Sentry Manual Setup Guide

Since the Sentry wizard requires Node.js >=18.20.6 and you have v18.19.1, I've configured Sentry manually.

## ✅ **What I've Already Done:**

### **Files Created:**
1. ✅ `sentry.client.config.ts` - Client-side configuration
2. ✅ `sentry.server.config.ts` - Server-side configuration  
3. ✅ `sentry.edge.config.ts` - Edge function configuration
4. ✅ `next.config.js` - Updated with Sentry wrapper
5. ✅ `.sentryclirc` - Sentry CLI configuration
6. ✅ `sentry.properties` - Sentry properties file
7. ✅ Test pages for error testing

### **Package Already Installed:**
- ✅ `@sentry/nextjs` is installed and ready

## 🔑 **What You Need to Do:**

### **Step 1: Get Your Sentry DSN**
1. Go to: https://prometheus-automation.sentry.io/
2. Navigate to **Settings** → **Projects** → **javascript-nextjs** 
3. Click on **Client Keys (DSN)**
4. Copy the DSN (looks like: `https://abc123@prometheus-automation.sentry.io/456789`)

### **Step 2: Update Your .env.local**
Replace these placeholder values in your `.env.local` file:

```bash
# Replace this line:
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@prometheus-automation.sentry.io/project-id

# With your actual DSN:
NEXT_PUBLIC_SENTRY_DSN=https://[your-actual-dsn]@prometheus-automation.sentry.io/[project-id]
```

### **Step 3: Get Auth Token (Optional - for source maps)**
1. Go to **Settings** → **Auth Tokens**
2. Click **Create New Token**
3. Select these scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
4. Copy the token and replace in `.env.local`:

```bash
# Replace:
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# With:
SENTRY_AUTH_TOKEN=[your-actual-token]
```

### **Step 4: Update Configuration Files**
Replace the token in these files with your actual token:
- `.sentryclirc`
- `sentry.properties`

## 🧪 **Test Your Setup:**

### **1. Start Development Server**
```bash
npm run dev
```

### **2. Test Error Reporting**
1. Visit: http://localhost:3000/sentry-example-page
2. Click "Throw error!" button
3. Check your Sentry dashboard for the error

### **3. Test API Error**
The button will also trigger an API error that should appear in Sentry.

## 🔧 **Configuration Details:**

### **Your Sentry Setup Includes:**
- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Transaction tracking and performance metrics
- **Session Replay**: Record user sessions (masked for privacy)
- **Source Maps**: Upload source maps for better stack traces
- **Vercel Cron Monitoring**: Automatic monitoring of cron jobs

### **Security Features:**
- **Tunneling**: Routes Sentry requests through `/monitoring` to bypass ad-blockers
- **Source Map Hiding**: Source maps are hidden in production bundles
- **Logger Tree-shaking**: Sentry logger statements removed in production

## 🚀 **Once Setup is Complete:**

You'll have:
- ✅ Real-time error monitoring
- ✅ Performance tracking
- ✅ User session replay
- ✅ Automatic error alerts
- ✅ Source map debugging
- ✅ Release tracking

## 📊 **Sentry Dashboard Features:**

After setup, you can:
- View all errors in real-time
- Track performance metrics
- Watch user session replays
- Set up alerts for critical errors
- Monitor release health
- Track user adoption

## 🆘 **If You Need Help:**

1. **DSN Issues**: Make sure the DSN format is correct
2. **No Errors Showing**: Check the Network tab for failed requests
3. **Source Maps**: Auth token is needed for source map uploads
4. **Development**: Errors may take a few seconds to appear

The manual setup provides the same functionality as the wizard - you just need to get your DSN and auth token from the Sentry dashboard!