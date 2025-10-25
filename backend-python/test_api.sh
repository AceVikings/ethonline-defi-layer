#!/bin/bash

# Test script for Python backend API endpoints

echo "🧪 Testing Python Backend API (Port 8080)"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing /health endpoint..."
curl -s http://localhost:8080/health | python -m json.tool
echo ""
echo ""

# Test 2: Workflow Generation  
echo "2️⃣  Testing /api/workflow/generate endpoint..."
curl -s -X POST http://localhost:8080/api/workflow/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "Create a workflow to swap ETH to USDC", "userAddress": "0x1234"}' \
  | python -m json.tool
echo ""
echo ""

# Test 3: Knowledge Query
echo "3️⃣  Testing /api/knowledge/query endpoint..."
curl -s -X POST http://localhost:8080/api/knowledge/query \
  -H "Content-Type: application/json" \
  -d '{"type": "strategies", "query": "yield"}' \
  | python -m json.tool
echo ""
echo ""

# Test 4: Intent Classification
echo "4️⃣  Testing /api/asi/classify endpoint..."
curl -s -X POST http://localhost:8080/api/asi/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I want to swap tokens and earn yield"}' \
  | python -m json.tool
echo ""
echo ""

echo "✅ All tests complete!"
