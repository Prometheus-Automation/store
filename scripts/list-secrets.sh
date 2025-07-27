#!/bin/bash

# Script to list available secrets in Google Secret Manager
# Project: prometheus-ai-marketplace

echo "🔍 Listing secrets in Google Secret Manager..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Set the project
PROJECT_ID="prometheus-ai-marketplace"
echo "📌 Project: $PROJECT_ID"
echo ""

# Set project
gcloud config set project $PROJECT_ID 2>/dev/null

# List all secrets
echo "📋 Available secrets:"
echo "===================="
gcloud secrets list --format="table(name,created,labels)" 2>/dev/null

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to list secrets. Possible reasons:"
    echo "   1. You don't have access to project: $PROJECT_ID"
    echo "   2. The project doesn't exist"
    echo "   3. You need to authenticate: gcloud auth login"
    echo ""
    echo "Current project: $(gcloud config get-value project)"
    echo "Current account: $(gcloud config get-value account)"
fi

echo ""
echo "💡 To view a specific secret value:"
echo "   gcloud secrets versions access latest --secret=SECRET_NAME"