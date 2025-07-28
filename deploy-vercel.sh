#!/bin/bash

# Vercel Deployment Script for Prometheus Automation AI Marketplace
# This script automates the deployment process to Vercel

set -e  # Exit on any error

echo "🚀 Starting Vercel deployment for Prometheus Automation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed.${NC}"
    echo "Please install it with: npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Check environment variables
echo -e "${YELLOW}Checking environment configuration...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Warning: .env.local not found. Make sure environment variables are set in Vercel dashboard.${NC}"
fi

# Run tests (if available)
echo -e "${YELLOW}Running pre-deployment checks...${NC}"
if npm run lint &> /dev/null; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${RED}✗ Linting failed${NC}"
    exit 1
fi

if npm run build &> /dev/null; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Deploy to Vercel
echo -e "${YELLOW}Deploying to Vercel...${NC}"

# Check if this is production deployment
if [ "$1" = "--production" ] || [ "$1" = "-p" ]; then
    echo -e "${YELLOW}Deploying to PRODUCTION...${NC}"
    vercel --prod --yes
    DEPLOYMENT_URL=$(vercel --prod --yes 2>/dev/null | grep -E "https://.*vercel\.app" | tail -1)
else
    echo -e "${YELLOW}Deploying to PREVIEW...${NC}"
    vercel --yes
    DEPLOYMENT_URL=$(vercel --yes 2>/dev/null | grep -E "https://.*vercel\.app" | tail -1)
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 URL: ${DEPLOYMENT_URL}${NC}"
    
    # Open in browser (optional)
    if [ "$2" = "--open" ] || [ "$2" = "-o" ]; then
        if command -v open &> /dev/null; then
            open "$DEPLOYMENT_URL"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$DEPLOYMENT_URL"
        fi
    fi
    
    # Run post-deployment health check
    echo -e "${YELLOW}Running health check...${NC}"
    sleep 10  # Wait for deployment to be ready
    
    if curl -s "${DEPLOYMENT_URL}/api/health" | grep -q '"status":"healthy"'; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed - please verify manually${NC}"
    fi
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify the application works correctly at: $DEPLOYMENT_URL"
echo "2. Check the Vercel dashboard for any issues"
echo "3. Monitor logs for any runtime errors"
echo "4. Update DNS records if this is a production deployment"