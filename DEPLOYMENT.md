# GitHub Pages Deployment Guide

## 🚀 How to Deploy to GitHub Pages

### Option 1: Automatic Deployment (Recommended)

1. **Enable GitHub Pages in your repository:**
   - Go to: https://github.com/Prometheus-Automation/store/settings/pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy on every push to main branch

2. **Your website will be available at:**
   ```
   https://prometheus-automation.github.io/store/
   ```

### Option 2: Manual Deployment

If you prefer manual deployment:

1. **Build the project locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy the `dist` folder:**
   - Go to repository settings > Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/dist" folder
   - Or use `gh-pages` branch (you'll need to push dist contents there)

## ✅ What's Configured

- **GitHub Actions Workflow:** Automatic build and deployment
- **SPA Routing:** Fixed for GitHub Pages with 404.html redirect
- **Base Path:** Set to `/store/` for GitHub Pages subdirectory
- **PWA Support:** Service worker and manifest configured
- **SEO Optimization:** Meta tags and structured data included

## 🔧 Local Testing

To test the GitHub Pages version locally:

```bash
# Build with GitHub Pages base path
npm run build

# Preview the built version
npm run preview
# Visit: http://localhost:4173/store/
```

## 📋 Features Available

- ✅ AI Marketplace with product catalog
- ✅ Shopping cart with Stripe checkout
- ✅ Product detail pages with routing
- ✅ Seller dashboard and community pages
- ✅ PWA functionality (offline support)
- ✅ Mobile responsive design
- ✅ SEO optimized for search engines

## 🌐 Alternative Hosting Options

If you prefer other hosting platforms:

- **Vercel:** Connect your GitHub repo for automatic deployments
- **Netlify:** Same as Vercel, supports SPA routing natively
- **Firebase Hosting:** Good for PWAs with offline functionality

## 🔍 Troubleshooting

If you see a white screen:
1. Check the browser console for errors
2. Ensure GitHub Pages is enabled in repository settings
3. Wait a few minutes for GitHub Actions to complete deployment
4. Clear browser cache and try again

The automatic deployment typically takes 2-3 minutes after pushing to main branch.