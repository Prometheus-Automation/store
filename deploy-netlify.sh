#!/bin/bash

# Quick Netlify deployment for OAuth testing
echo "🚀 Building for production deployment..."

# Build the app
npm run build

echo "📦 Build complete! Contents of dist/:"
ls -la dist/

echo ""
echo "🌐 To deploy to Netlify:"
echo "1. Go to https://app.netlify.com/drop"
echo "2. Drag and drop the 'dist' folder"
echo "3. Copy the generated URL"
echo "4. Add '[netlify-url]/auth/callback' to Supabase redirect URLs"
echo ""
echo "Or install Netlify CLI:"
echo "npm install -g netlify-cli"
echo "netlify deploy --prod --dir=dist"