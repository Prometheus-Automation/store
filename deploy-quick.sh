#!/bin/bash

# Quick deployment script for OAuth testing
# This will build and serve the app on all network interfaces

echo "🚀 Building the application..."
npm run build

echo "📦 Starting production preview on all interfaces..."
npx vite preview --host 0.0.0.0 --port 5173

echo "✅ App should be accessible on:"
echo "   - http://localhost:5173"
echo "   - http://$(hostname -I | awk '{print $1}'):5173"
echo "   - All network interfaces"