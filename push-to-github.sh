#!/bin/bash

# GitHub Push Script with Token Authentication
echo "🚀 Setting up GitHub authentication and pushing changes..."

# Check if we have the required information
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Please set your GitHub credentials first:"
    echo ""
    echo "   export GITHUB_USERNAME=\"your-github-username\""
    echo "   export GITHUB_TOKEN=\"ghp_your-personal-access-token\""
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Configure git user (required for commits)
git config user.name "$GITHUB_USERNAME"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"

# Update remote URL to use token authentication
git remote set-url origin "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/Prometheus-Automation/store.git"

# Push the changes
echo "📤 Pushing changes to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Your site will be deployed to: https://store.prometheusautomation.com"
    echo "⏱️  Deployment usually takes 2-3 minutes"
    echo ""
    echo "🧪 Test OAuth at: https://store.prometheusautomation.com/test-oauth"
else
    echo "❌ Push failed. Check your credentials and try again."
fi