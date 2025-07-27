#!/bin/bash

# Script to fetch secrets from Google Secret Manager
# Project: prometheus-ai-marketplace

echo "🔐 Fetching secrets from Google Secret Manager..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Set the project
PROJECT_ID="prometheus-ai-marketplace"
gcloud config set project $PROJECT_ID

# Function to fetch secret
fetch_secret() {
    local secret_name=$1
    local env_var_name=$2
    
    echo "Fetching $secret_name..."
    secret_value=$(gcloud secrets versions access latest --secret="$secret_name" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✅ Retrieved $secret_name"
        # Update .env.local
        if grep -q "^$env_var_name=" .env.local; then
            # On macOS use -i '', on Linux use -i
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^$env_var_name=.*|$env_var_name=$secret_value|" .env.local
            else
                sed -i "s|^$env_var_name=.*|$env_var_name=$secret_value|" .env.local
            fi
        else
            echo "$env_var_name=$secret_value" >> .env.local
        fi
    else
        echo "❌ Failed to fetch $secret_name"
        echo "   Make sure the secret exists in project: $PROJECT_ID"
    fi
}

# Fetch all secrets (using exact names from Google Secret Manager)
fetch_secret "VITE_SUPABASE_URL" "VITE_SUPABASE_URL"
fetch_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "VITE_SUPABASE_ANON_KEY"
# Note: SUPABASE_SERVICE_ROLE_KEY should NEVER be used in frontend code!
# fetch_secret "stripe-publishable-key" "VITE_STRIPE_PUBLISHABLE_KEY"

echo ""
echo "🎉 Secrets fetch completed!"
echo "📝 Check .env.local for updated values"
echo ""
echo "⚠️  IMPORTANT: Never commit .env.local to git!"