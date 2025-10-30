"""
Blockscout MCP Agent - Mailbox Mode

This agent wraps the Blockscout MCP server and makes it discoverable
on Agentverse for ASI:One and other agents to query blockchain data.

Features:
- Query blockchain data (balances, transactions, NFTs)
- Discoverable via ASI:One
- Mailbox connectivity for remote access
"""

import os
import sys
from pathlib import Path
from uagents import Agent, Context
from uagents.setup import fund_agent_if_low
import json
from dotenv import load_dotenv
import requests

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Import shared message models
from agents.models import BlockchainQuery, BlockchainResponse

load_dotenv()

# Blockscout MCP configuration
BLOCKSCOUT_MCP_URL = "https://mcp.blockscout.com/mcp"

# Create mailbox agent
SEED = os.getenv("BLOCKSCOUT_AGENT_SEED", "blockscout-mcp-agent-v1")
PORT = int(os.getenv("BLOCKSCOUT_AGENT_PORT", "8001"))

agent = Agent(
    name="blockscout_mcp",
    seed=SEED,
    port=PORT,
    mailbox=True,  # Enable mailbox mode
)

# Fund agent if needed (commented out for faster startup - agent will auto-register on network)
# fund_agent_if_low(agent.wallet.address())

print(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🔍 Blockscout MCP Agent (Mailbox Mode)             ║
║                                                              ║
║  Agent Address: {agent.address}
║                                                              ║
║  This agent provides blockchain data via Blockscout MCP:     ║
║  - Token balances and transfers                             ║
║  - Transaction history                                       ║
║  - NFT metadata and ownership                               ║
║  - Contract information                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")


def call_blockscout_mcp(tool_name: str, arguments: dict) -> dict:
    """
    Call Blockscout MCP server using JSON-RPC over HTTP.
    
    Args:
        tool_name: Name of the MCP tool to call
        arguments: Arguments for the tool
    
    Returns:
        Result from the MCP server
    """
    try:
        headers = {
            'Accept': 'application/json, text/event-stream',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; DeFi-Workflow/1.0)'
        }
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }
        
        response = requests.post(
            BLOCKSCOUT_MCP_URL,
            json=payload,
            headers=headers,
            timeout=30,
            stream=True
        )
        
        if response.status_code == 200:
            # Parse SSE stream to get final result
            final_result = None
            raw_lines = []
            for line in response.iter_lines(decode_unicode=True):
                if not line:
                    continue
                raw_lines.append(line)
                    
                if not line.startswith('data: '):
                    continue
                
                data_str = line[6:]  # Remove "data: " prefix
                try:
                    data = json.loads(data_str)
                    if isinstance(data, dict) and 'id' in data and 'result' in data:
                        final_result = data
                except json.JSONDecodeError as e:
                    print(f"[MCP] Failed to parse SSE line: {data_str[:100]}... Error: {e}")
                    continue
            
            if not final_result:
                print(f"[MCP] No final result found. Raw lines: {raw_lines[:5]}")
            
            if final_result and 'result' in final_result:
                content = final_result['result'].get('content', [])
                if content and len(content) > 0:
                    # Extract text from first content item
                    text_data = content[0].get('text', '{}')
                    
                    # For list_tools, the response is already structured, not JSON string
                    if tool_name == "list_tools":
                        return {"tools": final_result['result']}
                    
                    # For other tools, parse the JSON response
                    try:
                        return json.loads(text_data)
                    except json.JSONDecodeError as e:
                        # If it's not JSON, return as plain text
                        return {"result": text_data, "raw": True}
            
            return {"error": "No valid result in MCP response", "raw_lines": raw_lines[:5]}
        else:
            return {"error": f"HTTP {response.status_code}: {response.text[:200]}"}
            
    except Exception as e:
        return {"error": str(e)}


@agent.on_event("startup")
async def startup(ctx: Context):
    """Runs when agent starts up"""
    ctx.logger.info(f"✅ Blockscout MCP Agent started: {ctx.agent.address}")
    ctx.logger.info("📬 Mailbox mode enabled - connecting to Agentverse...")
    ctx.logger.info("🔍 Ready to serve blockchain data queries")


@agent.on_message(model=BlockchainQuery)
async def handle_blockchain_query(ctx: Context, sender: str, msg: BlockchainQuery):
    """
    Handle blockchain data queries.
    
    Examples:
    - "Get balance for 0x..."
    - "Get transactions for 0x..."
    - "Get token info for 0x..."
    """
    ctx.logger.info(f"📨 Query from {sender}: {msg.query}")
    
    try:
        query_lower = msg.query.lower()
        
        # Determine which Blockscout tool to call based on query
        if 'tool' in query_lower and ('list' in query_lower or 'what' in query_lower or 'available' in query_lower):
            # List available tools
            tool_name = "list_tools"
            arguments = {}
        
        elif 'balance' in query_lower or 'holdings' in query_lower:
            tool_name = "get_address_token_balances"
            arguments = {
                "chainId": msg.chain_id,
                "address": msg.address
            }
        
        elif 'transaction' in query_lower or 'transfers' in query_lower:
            tool_name = "get_address_transactions"
            arguments = {
                "chainId": msg.chain_id,
                "address": msg.address
            }
        
        elif 'nft' in query_lower:
            tool_name = "get_address_nfts"
            arguments = {
                "chainId": msg.chain_id,
                "address": msg.address
            }
        
        elif 'chain' in query_lower and 'list' in query_lower:
            tool_name = "get_chains_list"
            arguments = {}
        
        else:
            # Default to balance query
            tool_name = "get_address_token_balances"
            arguments = {
                "chainId": msg.chain_id,
                "address": msg.address
            }
        
        ctx.logger.info(f"🔧 Calling Blockscout MCP: {tool_name}")
        result = call_blockscout_mcp(tool_name, arguments)
        
        if 'error' in result:
            ctx.logger.error(f"❌ Error: {result['error']}")
            response = BlockchainResponse(
                success=False,
                error=result['error']
            )
        else:
            ctx.logger.info("✅ Query successful")
            response = BlockchainResponse(
                success=True,
                data=result
            )
        
        await ctx.send(sender, response)
        
    except Exception as e:
        ctx.logger.error(f"❌ Error: {str(e)}")
        error_response = BlockchainResponse(
            success=False,
            error=str(e)
        )
        await ctx.send(sender, error_response)


if __name__ == "__main__":
    print("🚀 Starting Blockscout MCP Agent (Mailbox Mode)...")
    agent.run()
