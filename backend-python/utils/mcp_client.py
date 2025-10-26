"""
MCP (Model Context Protocol) Client

Official MCP protocol client for blockchain and pricing data.
Supports:
- Official Blockscout MCP server (https://mcp.blockscout.com/mcp)
- Official CoinGecko MCP server (https://mcp.pro-api.coingecko.com/mcp)
- Direct API fallbacks for reliability
"""

import requests
from typing import Dict, Any, List, Optional
import json
import asyncio
from contextlib import AsyncExitStack


class MCPClient:
    """
    MCP (Model Context Protocol) client for blockchain and pricing data.
    
    Connects to official MCP servers using the MCP protocol specification.
    Falls back to direct API calls if MCP connection fails.
    """
    
    def __init__(self):
        """Initialize MCP client with multiple server support."""
        # MCP protocol sessions
        self.sessions: Dict[str, Any] = {}
        self.exit_stack = AsyncExitStack()
        self.initialized = False
        
        # Tool definitions and mappings
        self.tool_definitions: Dict[str, Dict[str, Any]] = {}
        self.tool_server_map: Dict[str, str] = {}
        
        # API keys and endpoints
        self.coingecko_api_key = 'CG-JWfCi4Jma9e9baief59WS9Ua'
        self.blockscout_mcp_url = "https://mcp.blockscout.com/mcp"
        self.coingecko_mcp_url = "https://mcp.pro-api.coingecko.com/mcp"
        
        # Initialize fallback tools (will be replaced if MCP connection succeeds)
        self._setup_blockscout_direct_api()
    
    async def initialize(self) -> None:
        """Initialize connections to all MCP servers."""
        if self.initialized:
            return
        
        print("🚀 Initializing MCP Client...")
        
        # Try to connect to both MCP servers
        await self._connect_to_blockscout_mcp()
        await self._connect_to_coingecko_mcp()
        
        self.initialized = True
        print(f"✅ MCP Client initialized with {len(self.tool_definitions)} tools")
    
    async def _connect_to_blockscout_mcp(self) -> None:
        """Connect to Blockscout MCP server using JSON-RPC over HTTP."""
        try:
            print(f"🔌 Connecting to Blockscout MCP...")
            
            # Blockscout uses JSON-RPC 2.0 over HTTP POST
            headers = {
                'Accept': 'application/json, text/event-stream',
                'Content-Type': 'application/json'
            }
            
            # First, list available tools
            list_tools_request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/list",
                "params": {}
            }
            
            response = requests.post(
                self.blockscout_mcp_url,
                json=list_tools_request,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                tools = result.get('result', {}).get('tools', [])
                
                # Remove old blockscout_direct tools
                old_tools = [k for k, v in self.tool_server_map.items() if v == 'blockscout_direct']
                for tool_name in old_tools:
                    if tool_name in self.tool_definitions:
                        del self.tool_definitions[tool_name]
                    if tool_name in self.tool_server_map:
                        del self.tool_server_map[tool_name]
                
                # Register MCP tools
                for tool in tools:
                    tool_name = f"blockscout_{tool['name']}"
                    tool_info = {
                        "type": "function",
                        "function": {
                            "name": tool_name,
                            "description": tool.get('description', f"Blockscout: {tool['name']}"),
                            "parameters": tool.get('inputSchema', {"type": "object", "properties": {}})
                        },
                        "_mcp_server": "blockscout",
                        "_mcp_tool_name": tool['name']
                    }
                    self.tool_definitions[tool_name] = tool_info
                    self.tool_server_map[tool_name] = 'blockscout_mcp'
                
                print(f"✅ Connected to Blockscout MCP ({len(tools)} tools)")
                
                # Store connection info for later use
                self.sessions['blockscout'] = {
                    'url': self.blockscout_mcp_url,
                    'headers': headers,
                    'type': 'jsonrpc'
                }
            else:
                print(f"⚠️  Blockscout MCP returned status {response.status_code}")
                print(f"   Using direct API fallback")
            
        except requests.exceptions.Timeout:
            print(f"⚠️  Blockscout MCP connection timeout")
            print(f"   Using direct API fallback")
        except requests.RequestException as e:
            print(f"⚠️  Blockscout MCP unavailable: {e}")
            print(f"   Using direct API fallback")
        except Exception as e:
            print(f"⚠️  Blockscout MCP error: {e}")
            print(f"   Using direct API fallback")
    
    async def _connect_to_coingecko_mcp(self) -> None:
        """Connect to CoinGecko MCP server using simple HTTP."""
        try:
            print(f"🔌 Connecting to CoinGecko MCP...")
            
            # CoinGecko expects API key header
            headers = {
                'x-cg-pro-api-key': self.coingecko_api_key,
                'Accept': 'text/event-stream',
                'User-Agent': 'Mozilla/5.0 (compatible; DeFi-Workflow/1.0)'
            }
            
            # Simple GET request with timeout
            response = requests.get(
                self.coingecko_mcp_url,
                headers=headers,
                timeout=10,
                stream=True
            )
            
            if response.status_code == 200:
                print(f"✅ Connected to CoinGecko MCP (using HTTP fallback)")
                print(f"   Using direct API tools for pricing")
            else:
                print(f"⚠️  CoinGecko MCP returned status {response.status_code}")
            
        except requests.RequestException as e:
            print(f"⚠️  CoinGecko MCP unavailable: {e}")
        except Exception as e:
            print(f"⚠️  CoinGecko MCP error: {e}")
    
    def _setup_blockscout_direct_api(self) -> None:
        """Setup direct API fallback for Blockscout."""
        tools = self.get_blockscout_direct_tools()
        for tool in tools:
            tool_name = tool['function']['name']
            self.tool_definitions[tool_name] = tool
            self.tool_server_map[tool_name] = 'blockscout_direct'
    
    async def cleanup(self):
        """Close all MCP connections."""
        await self.exit_stack.aclose()
    
    def get_blockscout_direct_tools(self) -> List[Dict[str, Any]]:
        """
        Get tool definitions for Blockscout direct API (fallback).
        
        Returns:
            List of tool definitions in OpenAI function calling format
        """
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "blockscout_get_transactions",
                    "description": "Get transaction history for a blockchain address. Returns recent transactions with details like hash, value, timestamp, and status.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "address": {
                                "type": "string",
                                "description": "The blockchain address to get transactions for (0x...)"
                            },
                            "chainId": {
                                "type": "string",
                                "description": "Chain ID (e.g., '1' for Ethereum, '8453' for Base)",
                                "default": "8453"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of transactions to return",
                                "default": 10
                            }
                        },
                        "required": ["address"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "blockscout_get_balance",
                    "description": "Get token balances for a blockchain address. Returns native token balance and ERC-20 token holdings.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "address": {
                                "type": "string",
                                "description": "The blockchain address to get balances for (0x...)"
                            },
                            "chainId": {
                                "type": "string",
                                "description": "Chain ID (e.g., '1' for Ethereum, '8453' for Base)",
                                "default": "8453"
                            }
                        },
                        "required": ["address"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "blockscout_get_token_info",
                    "description": "Get detailed information about a specific token. Returns token name, symbol, decimals, total supply, and contract details.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "tokenAddress": {
                                "type": "string",
                                "description": "The token contract address (0x...)"
                            },
                            "chainId": {
                                "type": "string",
                                "description": "Chain ID (e.g., '1' for Ethereum, '8453' for Base)",
                                "default": "8453"
                            }
                        },
                        "required": ["tokenAddress"]
                    }
                }
            }
        ]
        
        return tools
    
    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """
        Execute a tool by name.
        
        Args:
            tool_name: Name of the tool to execute
            arguments: Tool arguments
            
        Returns:
            Tool execution result as string
        """
        server_type = self.tool_server_map.get(tool_name)
        
        if not server_type:
            return f"Unknown tool: {tool_name}"
        
        # Execute via MCP session
        if server_type == 'blockscout_mcp':
            return await self._execute_mcp_tool('blockscout', tool_name, arguments)
        elif server_type == 'coingecko_mcp':
            return await self._execute_mcp_tool('coingecko', tool_name, arguments)
        # Execute via direct API
        elif server_type == 'blockscout_direct':
            return self._execute_blockscout_direct(tool_name, arguments)
        else:
            return f"Unknown server type: {server_type}"
    
    async def _execute_mcp_tool(self, server: str, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Execute tool via MCP JSON-RPC."""
        try:
            session = self.sessions.get(server)
            if not session:
                return f"Not connected to {server} MCP server"
            
            # Get the original tool name (without prefix)
            tool_def = self.tool_definitions.get(tool_name)
            if not tool_def or '_mcp_tool_name' not in tool_def:
                return f"Tool definition not found for {tool_name}"
            
            original_tool_name = tool_def['_mcp_tool_name']
            
            # Call the tool via JSON-RPC
            if session.get('type') == 'jsonrpc':
                request = {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "tools/call",
                    "params": {
                        "name": original_tool_name,
                        "arguments": arguments
                    }
                }
                
                response = requests.post(
                    session['url'],
                    json=request,
                    headers=session['headers'],
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if 'result' in result:
                        # Format the content
                        content = result['result'].get('content', [])
                        if isinstance(content, list):
                            return '\n'.join([str(item.get('text', item)) for item in content])
                        return str(content)
                    elif 'error' in result:
                        return f"Error: {result['error'].get('message', result['error'])}"
                    return str(result)
                else:
                    return f"HTTP Error {response.status_code}: {response.text[:200]}"
            else:
                return f"Unsupported session type for {server}"
            
        except Exception as e:
            return f"Error executing {tool_name} via MCP: {str(e)}"
    
    def _execute_blockscout_direct(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Execute Blockscout tool via direct API."""
        try:
            # Extract chain ID
            chain_id = arguments.get('chainId', '8453')
            
            # Map chain ID to Blockscout instance
            blockscout_urls = {
                '1': 'https://eth.blockscout.com/api',
                '8453': 'https://base.blockscout.com/api',
                '84532': 'https://base-sepolia.blockscout.com/api',
                '11155111': 'https://eth-sepolia.blockscout.com/api'
            }
            
            base_url = blockscout_urls.get(chain_id, 'https://base.blockscout.com/api')
            
            if tool_name == "blockscout_get_transactions":
                return self._get_transactions(base_url, arguments)
            elif tool_name == "blockscout_get_balance":
                return self._get_balance(base_url, arguments)
            elif tool_name == "blockscout_get_token_info":
                return self._get_token_info(base_url, arguments)
            else:
                return f"Unknown tool: {tool_name}"
                
        except Exception as e:
            return f"Error executing {tool_name}: {str(e)}"
    
    def _get_transactions(self, base_url: str, args: Dict[str, Any]) -> str:
        """Get transaction history via direct API."""
        address = args.get('address')
        limit = args.get('limit', 10)
        
        try:
            # Blockscout API doesn't accept limit in query params
            response = requests.get(
                f"{base_url}/v2/addresses/{address}/transactions",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                items = data.get('items', [])
                
                if not items:
                    return f"No transactions found for address {address}"
                
                # Limit the results after fetching
                limited_items = items[:limit]
                
                result = f"Found {len(items)} total transactions for {address}. Showing first {len(limited_items)}:\n\n"
                for tx in limited_items:
                    value_wei = tx.get('value', '0')
                    # Convert wei to ETH for readability
                    try:
                        value_eth = float(value_wei) / 1e18
                        value_str = f"{value_eth:.6f} ETH" if value_eth > 0 else "0 ETH"
                    except:
                        value_str = f"{value_wei} wei"
                    
                    result += f"- Hash: {tx.get('hash', 'N/A')[:16]}...{tx.get('hash', 'N/A')[-4:]}\n"
                    result += f"  Value: {value_str}\n"
                    result += f"  Status: {tx.get('status', 'unknown')}\n"
                    result += f"  From: {tx.get('from', {}).get('hash', 'N/A')[:10]}...\n"
                    result += f"  To: {tx.get('to', {}).get('hash', 'N/A')[:10]}...\n"
                    result += f"  Timestamp: {tx.get('timestamp', 'N/A')}\n"
                    result += f"  Method: {tx.get('method', 'transfer') or 'transfer'}\n\n"
                
                return result
            else:
                return f"Error fetching transactions: HTTP {response.status_code}"
                
        except Exception as e:
            return f"Error fetching transactions: {str(e)}"
    
    def _get_balance(self, base_url: str, args: Dict[str, Any]) -> str:
        """Get token balances via direct API."""
        address = args.get('address')
        
        try:
            response = requests.get(
                f"{base_url}/v2/addresses/{address}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                result = f"Balances for {address}:\n\n"
                
                # Native token balance
                coin_balance = data.get('coin_balance', '0')
                try:
                    balance_eth = float(coin_balance) / 1e18
                    result += f"Native Token: {balance_eth:.6f} ETH\n"
                except:
                    result += f"Native Token: {coin_balance} wei\n"
                
                # ERC-20 tokens
                if 'token_balances' in data and data['token_balances']:
                    result += f"\nERC-20 Tokens:\n"
                    for token in data['token_balances']:
                        token_info = token.get('token', {})
                        result += f"- {token_info.get('name', 'Unknown')}: {token.get('value', '0')}\n"
                
                return result
            else:
                return f"Error fetching balance: HTTP {response.status_code}"
                
        except Exception as e:
            return f"Error fetching balance: {str(e)}"
    
    def _get_token_info(self, base_url: str, args: Dict[str, Any]) -> str:
        """Get token information via direct API."""
        token_address = args.get('tokenAddress')
        
        try:
            response = requests.get(
                f"{base_url}/v2/tokens/{token_address}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                result = f"Token Information:\n\n"
                result += f"Name: {data.get('name', 'Unknown')}\n"
                result += f"Symbol: {data.get('symbol', 'Unknown')}\n"
                result += f"Decimals: {data.get('decimals', 'Unknown')}\n"
                result += f"Total Supply: {data.get('total_supply', 'Unknown')}\n"
                result += f"Type: {data.get('type', 'Unknown')}\n"
                result += f"Address: {data.get('address', token_address)}\n"
                
                return result
            else:
                return f"Error fetching token info: HTTP {response.status_code}"
                
        except Exception as e:
            return f"Error fetching token info: {str(e)}"
    
    def get_tools_for_server(self, server_type: str) -> List[Dict[str, Any]]:
        """
        Get tool definitions for a specific MCP server type.
        
        Args:
            server_type: Type of MCP server (e.g., 'blockscout', 'coingecko')
            
        Returns:
            List of tool definitions
        """
        if server_type == 'blockscout':
            # Return all blockscout tools (both MCP and direct)
            return [tool for name, tool in self.tool_definitions.items() 
                    if name.startswith('blockscout_')]
        elif server_type == 'coingecko':
            # Return all coingecko tools
            return [tool for name, tool in self.tool_definitions.items() 
                    if name.startswith('coingecko_')]
        else:
            return list(self.tool_definitions.values())
    
    def get_all_tools(self) -> List[Dict[str, Any]]:
        """Get all available tool definitions."""
        return list(self.tool_definitions.values())


# For backwards compatibility - sync wrapper
class MCPClientSync:
    """Synchronous wrapper for MCPClient."""
    
    def __init__(self, auto_connect: bool = False):
        """
        Initialize MCP client.
        
        Args:
            auto_connect: If True, connect to MCP servers immediately.
                         If False, only connect when first needed (lazy loading).
        """
        self.client = MCPClient()
        self._initialized = False
        
        if auto_connect:
            print("🔌 Initializing MCP Client (sync wrapper)...")
            asyncio.run(self.client.initialize())
            self._initialized = True
            print(f"✅ MCP Client ready with {len(self.client.tool_definitions)} tools")
        else:
            print("🔌 MCP Client created (will connect on first use)")
    
    def _ensure_initialized(self):
        """Ensure the client is initialized (lazy loading)."""
        if not self._initialized:
            print("🔌 Connecting to MCP servers (first use)...")
            asyncio.run(self.client.initialize())
            self._initialized = True
            print(f"✅ MCP Client ready with {len(self.client.tool_definitions)} tools")
    
    def get_tools_for_server(self, server_type: str) -> List[Dict[str, Any]]:
        """Get tools for a server."""
        self._ensure_initialized()
        return self.client.get_tools_for_server(server_type)
    
    def get_all_tools(self) -> List[Dict[str, Any]]:
        """Get all tools."""
        self._ensure_initialized()
        return self.client.get_all_tools()
    
    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Execute a tool."""
        self._ensure_initialized()
        return asyncio.run(self.client.execute_tool(tool_name, arguments))


if __name__ == "__main__":
    # Test the MCP client
    async def test():
        client = MCPClient()
        await client.initialize()
        
        print("\n📋 Available Tools:")
        for tool_name, tool_def in client.tool_definitions.items():
            print(f"  - {tool_name}: {tool_def['function']['description'][:80]}...")
        
        await client.cleanup()
    
    asyncio.run(test())
