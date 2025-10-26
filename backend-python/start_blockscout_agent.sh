#!/bin/bash

# Start Blockscout MCP Agent

echo "🚀 Starting Blockscout MCP Agent..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env with:"
    echo "  AGENTVERSE_API_KEY=your_key"
    echo "  BLOCKSCOUT_AGENT_SEED=blockscout-mcp-agent-v1"
    echo "  BLOCKSCOUT_AGENT_PORT=8001"
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Run the agent
python agents/blockscout_mcp_agent.py
