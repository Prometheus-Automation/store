#!/bin/bash

# Setup ngrok for OAuth testing
echo "🚀 Setting up ngrok tunnel for OAuth testing..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📥 Installing ngrok..."
    
    # Download and install ngrok
    curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
    sudo apt update && sudo apt install ngrok
fi

echo "🌐 Starting ngrok tunnel on port 5173..."
echo "📋 Your app will be accessible via a public HTTPS URL"
echo "🔗 Copy the HTTPS URL and add it to Supabase redirect URLs"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

ngrok http 5173