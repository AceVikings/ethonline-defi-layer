#!/bin/bash

# Start DeFi Workflow Python Backend
# This script starts the Flask server for ASI integration

echo "🚀 Starting DeFi Workflow Python Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "📚 Checking dependencies..."
pip install -q -r requirements.txt

# Start the Flask server
echo ""
echo "✅ Starting Flask server on port 5000..."
echo "   Press Ctrl+C to stop"
echo ""

python server.py
