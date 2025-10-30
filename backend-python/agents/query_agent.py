"""
Query Agent - Client agent to communicate with mailbox agents

This agent acts as a bridge to send queries to mailbox-mode agents like the Blockscout agent.
It runs locally with an HTTP endpoint and can receive requests from the Flask server via REST.
"""

import os
from typing import Dict
from uagents import Agent, Context, Model

# Message models - must match Blockscout agent's models
class BlockchainQuery(Model):
    """Query model for blockchain data requests"""
    query: str
    chain_id: str = "8453"  # Default to Base mainnet
    address: str = ""

class BlockchainResponse(Model):
    """Response model from blockchain queries"""
    success: bool
    data: Dict = {}
    error: str = ""

# Agent addresses
BLOCKSCOUT_AGENT_ADDRESS = os.getenv(
    "BLOCKSCOUT_AGENT_ADDRESS",
    "agent1qfwanzm7l94lcd57p9zsl25y4p6clssp8xjjrd0f8f6nc9r3rx8h6978x2r"
)

# Query agent configuration
QUERY_AGENT_SEED = os.getenv("QUERY_AGENT_SEED", "deflow-query-agent-seed-v1")
QUERY_AGENT_PORT = int(os.getenv("QUERY_AGENT_PORT", "8002"))

# Initialize the query agent with HTTP endpoint (NOT mailbox mode)
# This agent needs an endpoint so it can receive messages back from mailbox agents
query_agent = Agent(
    name="deflow_query_agent",
    seed=QUERY_AGENT_SEED,
    port=QUERY_AGENT_PORT,
    endpoint=[f"http://127.0.0.1:{QUERY_AGENT_PORT}/submit"],
)

@query_agent.on_event("startup")
async def startup(ctx: Context):
    """Log agent startup and send initial test query"""
    ctx.logger.info(f"✅ Query Agent started!")
    ctx.logger.info(f"   Address: {query_agent.address}")
    ctx.logger.info(f"   Port: {QUERY_AGENT_PORT}")
    ctx.logger.info(f"   Endpoint: http://127.0.0.1:{QUERY_AGENT_PORT}/submit")
    ctx.logger.info(f"   Target: {BLOCKSCOUT_AGENT_ADDRESS}")
    ctx.logger.info("")
    ctx.logger.info("Ready to send queries to Blockscout mailbox agent!")

@query_agent.on_interval(period=60.0)
async def send_test_query(ctx: Context):
    """Send a test query every 60 seconds to verify communication"""
    ctx.logger.info("📤 Sending periodic test query to Blockscout agent...")
    
    await ctx.send(
        BLOCKSCOUT_AGENT_ADDRESS,
        BlockchainQuery(
            query="What tools do you have access to?",
            chain_id="8453",
            address=""
        )
    )
    
    ctx.logger.info("   Query sent! Waiting for response...")

@query_agent.on_message(model=BlockchainResponse)
async def handle_blockchain_response(ctx: Context, sender: str, msg: BlockchainResponse):
    """Handle responses from Blockscout agent"""
    ctx.logger.info(f"📥 Received BlockchainResponse from {sender}")
    ctx.logger.info(f"   Success: {msg.success}")
    
    if msg.success:
        ctx.logger.info(f"   ✅ Data: {msg.data}")
    else:
        ctx.logger.error(f"   ❌ Error: {msg.error}")
    
    ctx.logger.info("Response processed successfully!")

# Main entry point for testing
if __name__ == "__main__":
    print("🤖 Starting DeFi Query Agent...")
    print(f"   Address: {query_agent.address}")
    print(f"   Port: {QUERY_AGENT_PORT}")
    print(f"   Endpoint: http://127.0.0.1:{QUERY_AGENT_PORT}/submit")
    print(f"   Target Blockscout Agent: {BLOCKSCOUT_AGENT_ADDRESS}")
    print()
    print("📡 Will send test query every 60 seconds")
    print()
    print("Ready to communicate with mailbox agents!")
    
    query_agent.run()

# Main entry point for testing
if __name__ == "__main__":
    print("🤖 Starting DeFi Query Agent...")
    print(f"   Address: {query_agent.address}")
    print(f"   Port: {QUERY_AGENT_PORT}")
    print(f"   Endpoint: http://127.0.0.1:{QUERY_AGENT_PORT}/submit")
    print()
    print("Ready to send queries to mailbox agents!")
    
    query_agent.run()
