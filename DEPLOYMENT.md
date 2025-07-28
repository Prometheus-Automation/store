# Deployment Guide - Prometheus Automation AI Marketplace

This guide covers the complete deployment process for the Next.js AI marketplace to Vercel.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ installed
- Vercel CLI installed: `npm i -g vercel`
- Supabase project set up
- Stripe account configured

### One-Click Deployment
```bash
# Clone and deploy
git clone <your-repo>
cd Store
npm install
./deploy-vercel.sh --production --open
```

## 🔧 Manual Deployment Steps

### 1. Environment Configuration

**Required Environment Variables in Vercel:**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://store.prometheusautomation.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | `eyJ...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `CRON_SECRET` | Secret for cron jobs | `your-random-secret` |

### 2. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## 🏗️ Architecture Overview

### API Endpoints

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/ai/recommendations` | AI recommendations | GET, POST |
| `/api/ai/pricing` | Dynamic pricing | GET, POST |
| `/api/ai/search` | Semantic search | GET, POST, PUT |
| `/api/ai/models` | Model CRUD | GET, POST |
| `/api/health` | Health monitoring | GET |
| `/api/sitemap` | SEO sitemap | GET |

### Scheduled Jobs (Cron)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `update-pricing` | Every 6 hours | Update model pricing |
| `recompute-recommendations` | Daily at 2 AM | Refresh recommendations |

## 📈 Post-Deployment Checklist

### Domain Configuration
- [ ] Add custom domain in Vercel dashboard
- [ ] Configure DNS records
- [ ] Verify SSL certificate (automatic)

### Monitoring Setup
- [ ] Configure uptime monitoring
- [ ] Set up error alerts
- [ ] Monitor performance metrics

---

**Status**: Production Ready ✅