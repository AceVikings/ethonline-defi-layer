"""
Register Blockscout MCP Agent on Agentverse using ASI MCP

This script uses the ASI MCP to programmatically register and configure
the Blockscout MCP agent on Agentverse, making it discoverable via ASI:One.
"""

import os
import sys
import time
from dotenv import load_dotenv

load_dotenv()

# Import ASI MCP tools (available via the MCP server)
try:
    from mcp_asi_mcp import (
        mcp_asi_mcp_list_user_agents,
        mcp_asi_mcp_get_user_agent_details,
        mcp_asi_mcp_update_user_agent_mailbox,
        mcp_asi_mcp_get_user_agent_profile
    )
    ASI_MCP_AVAILABLE = True
except ImportError:
    print("⚠️  ASI MCP not available - will provide manual instructions")
    ASI_MCP_AVAILABLE = False

# Configuration
API_TOKEN = os.getenv('AGENTVERSE_API_KEY')
AGENT_SEED = os.getenv('BLOCKSCOUT_AGENT_SEED', 'blockscout-mcp-agent-v1')

# Agent metadata
AGENT_NAME = "Blockscout MCP Data Provider"
AGENT_DESCRIPTION = "Provides blockchain data via Blockscout MCP server"
AGENT_README = """# Blockscout MCP Agent

This agent provides real-time blockchain data through the Blockscout MCP server.

## Capabilities

- **Token Balances**: Get ERC20 and native token balances for any address
- **Transaction History**: Retrieve transaction history with full details
- **NFT Data**: Query NFT holdings and metadata
- **Chain Information**: List all supported blockchain networks

## Supported Chains

- Ethereum (Mainnet & Sepolia)
- Base (Mainnet & Sepolia)
- Optimism
- Arbitrum
- Polygon
- And 60+ more chains via Blockscout

## How to Use

Send a `BlockchainQuery` message with:
- `query`: Natural language query (e.g., "Get balance for 0x...")
- `chain_id`: Chain ID (default: "8453" for Base)
- `address`: Blockchain address to query

## Example Queries

1. "Get balance for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
2. "Show transactions for 0x..."
3. "What NFTs does 0x... own?"
4. "List all supported chains"

## Technical Details

- **MCP Server**: https://mcp.blockscout.com/mcp
- **Protocol**: JSON-RPC over HTTP with SSE responses
- **Update Frequency**: Real-time data from Blockscout indexers
- **Rate Limits**: Subject to Blockscout API limits

## Integration

This agent is designed to work with:
- ASI:One for natural language blockchain queries
- DeFi workflow automation systems
- AI-powered portfolio analysis tools
"""


def generate_agent_address_from_seed(seed: str) -> str:
    """
    Generate agent address from seed (simplified version).
    In production, this would use the actual uagents library.
    """
    # This is a placeholder - actual address comes from running agent
    # For now, return placeholder that user will replace
    return "agent1q..." # User must fill this from actual agent startup


def register_agent_via_mcp(agent_address: str):
    """Register agent on Agentverse using ASI MCP tools."""
    
    if not API_TOKEN:
        print("❌ Error: AGENTVERSE_API_KEY not set in .env")
        return False
    
    if not agent_address or agent_address == "agent1q...":
        print("❌ Error: Valid agent address required")
        print("   Run the agent first to get its address:")
        print("   python agents/blockscout_mcp_agent.py")
        return False
    
    try:
        # 1. Check if agent exists
        print("🔍 Checking if agent exists on Agentverse...")
        try:
            agent_details = mcp_asi_mcp_get_user_agent_details(
                address=agent_address,
                api_token=API_TOKEN
            )
            print(f"✅ Agent found: {agent_details.get('name', 'Unknown')}")
            agent_exists = True
        except Exception:
            print("ℹ️  Agent not found - will be auto-registered when it connects")
            agent_exists = False
        
        # 2. Update agent profile
        print("📝 Updating agent profile...")
        result = mcp_asi_mcp_update_user_agent_mailbox(
            address=agent_address,
            api_token=API_TOKEN,
            name=AGENT_NAME,
            short_description=AGENT_DESCRIPTION,
            readme=AGENT_README,
            agent_type="mailbox"
        )
        
        print("✅ Agent profile updated successfully!")
        print(f"   Name: {AGENT_NAME}")
        print(f"   Type: Mailbox")
        
        # 3. Get updated profile
        print("🔍 Fetching updated profile...")
        profile = mcp_asi_mcp_get_user_agent_profile(
            address=agent_address,
            api_token=API_TOKEN
        )
        
        print("✅ Agent profile:")
        print(f"   Address: {agent_address}")
        print(f"   Name: {profile.get('name', 'N/A')}")
        print(f"   URL: https://agentverse.ai/agents/{agent_address}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error registering agent: {e}")
        return False


def list_all_agents():
    """List all user agents on Agentverse."""
    
    if not API_TOKEN:
        print("❌ Error: AGENTVERSE_API_KEY not set")
        return
    
    try:
        print("📋 Fetching all agents...")
        result = mcp_asi_mcp_list_user_agents(
            api_token=API_TOKEN
        )
        
        # Parse result (format may vary)
        agents = result if isinstance(result, list) else []
        
        if not agents:
            print("ℹ️  No agents found")
            return
        
        print(f"✅ Found {len(agents)} agent(s):")
        for i, agent in enumerate(agents, 1):
            addr = agent.get('address', 'N/A')
            name = agent.get('name', 'Unnamed')
            print(f"   {i}. {name}")
            print(f"      Address: {addr}")
            print(f"      URL: https://agentverse.ai/agents/{addr}")
        
    except Exception as e:
        print(f"❌ Error listing agents: {e}")


def provide_manual_instructions(agent_address: str):
    """Provide manual registration instructions."""
    
    print("\n" + "="*60)
    print("MANUAL REGISTRATION INSTRUCTIONS")
    print("="*60)
    print()
    print("Since ASI MCP is not available, follow these steps:")
    print()
    print("1. Start the Blockscout MCP agent:")
    print("   python agents/blockscout_mcp_agent.py")
    print()
    print("2. Copy the agent address from the startup output")
    print()
    print("3. Open the Inspector URL (shown in output)")
    print()
    print("4. Click 'Connect' → 'Mailbox'")
    print()
    print("5. Go to Agentverse dashboard:")
    print("   https://agentverse.ai/agents/local")
    print()
    print("6. Find your agent and update its profile:")
    print(f"   - Name: {AGENT_NAME}")
    print(f"   - Description: {AGENT_DESCRIPTION}")
    print()
    print("7. Your agent is now discoverable via ASI:One!")
    print()
    print("="*60)


def main():
    """Main registration flow."""
    
    print("🚀 Blockscout MCP Agent Registration Tool")
    print()
    
    # Check if ASI MCP is available
    if not ASI_MCP_AVAILABLE:
        print("⚠️  ASI MCP tools not available")
        provide_manual_instructions("")
        return
    
    # Get agent address from user
    print("To register the agent, you need its address.")
    print("Run the agent first if you haven't:")
    print("  python agents/blockscout_mcp_agent.py")
    print()
    
    agent_address = input("Enter agent address (or press Enter to list all agents): ").strip()
    
    if not agent_address:
        # List all agents
        list_all_agents()
        print()
        agent_address = input("Enter agent address to update: ").strip()
    
    if not agent_address or not agent_address.startswith("agent1"):
        print("❌ Invalid agent address")
        return
    
    # Register agent
    success = register_agent_via_mcp(agent_address)
    
    if success:
        print()
        print("="*60)
        print("✅ REGISTRATION COMPLETE!")
        print("="*60)
        print()
        print("Your Blockscout MCP agent is now registered on Agentverse!")
        print()
        print("Next steps:")
        print("1. Make sure the agent is running:")
        print("   python agents/blockscout_mcp_agent.py")
        print()
        print("2. Test it via ASI:One or Agentverse chat")
        print()
        print("3. Integrate with workflows using the AI node")
        print()
        print(f"Agent URL: https://agentverse.ai/agents/{agent_address}")
        print("="*60)
    else:
        print()
        print("❌ Registration failed - see errors above")
        provide_manual_instructions(agent_address)


if __name__ == "__main__":
    main()
