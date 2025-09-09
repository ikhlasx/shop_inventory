#!/bin/bash

# Vercel Deployment Script
# This script helps automate the deployment process to Vercel

echo "🚀 Starting Vercel deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: No .env file found"
    echo "📝 Please create a .env file with your environment variables:"
    echo "   REACT_APP_BACKEND_URL=https://your-backend-domain.com"
    echo "   DISABLE_HOT_RELOAD=true"
    echo ""
    read -p "Do you want to continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📱 Your app should now be live on Vercel!"
echo "🔧 Don't forget to set your environment variables in the Vercel dashboard:"
echo "   - REACT_APP_BACKEND_URL"
echo "   - DISABLE_HOT_RELOAD" 