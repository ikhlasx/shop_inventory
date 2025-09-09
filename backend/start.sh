#!/bin/bash

# Startup script for the backend API

echo "🚀 Starting Shop Inventory Backend API..."

# Set default port if not provided
export PORT=${PORT:-10000}

# Check if required environment variables are set
if [ -z "$MONGO_URL" ]; then
    echo "❌ Error: MONGO_URL environment variable is required"
    exit 1
fi

if [ -z "$DB_NAME" ]; then
    echo "❌ Error: DB_NAME environment variable is required"
    exit 1
fi

echo "✅ Environment variables verified"
echo "🌍 Port: $PORT"
echo "🗄️  Database: $DB_NAME"

# Start the FastAPI server with uvicorn
echo "🔥 Starting uvicorn server..."
exec uvicorn server:app --host 0.0.0.0 --port $PORT --log-level info 