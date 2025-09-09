#!/bin/bash

# Render Backend Deployment Helper Script
# This script helps prepare and validate your backend for Render deployment

echo "🚀 Render Backend Deployment Helper"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found in current directory"
    echo "📁 Please run this script from the repository root"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found"
    exit 1
fi

# Check required backend files
echo "🔍 Checking backend files..."

if [ ! -f "backend/server.py" ]; then
    echo "❌ Error: backend/server.py not found"
    exit 1
fi

if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: backend/requirements.txt not found"
    exit 1
fi

echo "✅ Backend files found"

# Validate requirements.txt
echo "📦 Validating requirements.txt..."
if grep -q "fastapi" backend/requirements.txt && grep -q "uvicorn" backend/requirements.txt; then
    echo "✅ FastAPI and Uvicorn found in requirements.txt"
else
    echo "❌ Error: FastAPI or Uvicorn missing from requirements.txt"
    exit 1
fi

# Check for environment variables
echo "🔧 Checking environment configuration..."
if grep -q "MONGO_URL" backend/server.py && grep -q "DB_NAME" backend/server.py; then
    echo "✅ Environment variables configured in server.py"
else
    echo "⚠️  Warning: Make sure MONGO_URL and DB_NAME are configured"
fi

# Validate render.yaml
echo "📋 Validating render.yaml..."
if grep -q "rootDir: ./backend" render.yaml; then
    echo "✅ Root directory correctly set to ./backend"
else
    echo "❌ Error: rootDir not set to ./backend in render.yaml"
    exit 1
fi

if grep -q "uvicorn server:app" render.yaml; then
    echo "✅ Start command correctly configured"
else
    echo "❌ Error: Start command not properly configured in render.yaml"
    exit 1
fi

echo ""
echo "🎉 Backend is ready for Render deployment!"
echo ""
echo "📝 Next steps:"
echo "1. Push your code to GitHub/GitLab"
echo "2. Go to https://dashboard.render.com"
echo "3. Click 'New' → 'Blueprint'"
echo "4. Connect your repository"
echo "5. Set environment variables:"
echo "   - MONGO_URL=your_mongodb_connection_string"
echo "   - DB_NAME=shop_inventory"
echo "   - CORS_ORIGINS=https://your-frontend-domain.vercel.app"
echo "6. Deploy!"
echo ""
echo "📖 Full guide available in RENDER_DEPLOYMENT.md"

# Optional: Test local server
read -p "🧪 Do you want to test the server locally? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Testing local server..."
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "📦 Creating virtual environment..."
        python -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        echo "⚠️  Warning: No .env file found"
        echo "📝 Create a .env file with:"
        echo "   MONGO_URL=your_mongodb_connection_string"
        echo "   DB_NAME=shop_inventory"
        echo "   CORS_ORIGINS=http://localhost:3000"
        echo ""
        read -p "Continue without .env file? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo "🚀 Starting local server on http://localhost:8000"
    echo "🔗 API docs will be available at http://localhost:8000/docs"
    echo "🛑 Press Ctrl+C to stop the server"
    
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
fi 