"""
ASI:One API Client

This module provides integration with ASI:One for LLM-powered
intent classification and natural language processing.

Version: 2.0 (Enhanced prompts with chain parsing and token address mappings)
"""

import os
import requests
from typing import Dict, Tuple, Any

CLIENT_VERSION = "2.0"

class ASIOneClient:
    """
    Client for interacting with ASI:One API for LLM capabilities.
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize ASI:One client.
        
        Args:
            api_key: ASI:One API key. If not provided, reads from environment.
        """
        self.api_key = api_key or os.getenv('ASI_ONE_API_KEY')
        if not self.api_key:
            raise ValueError("ASI_ONE_API_KEY not found in environment or provided")
        
        self.base_url = "https://api.asi1.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def get_intent_and_keyword(self, user_query: str) -> Tuple[str, str]:
        """
        Classify user intent and extract key information.
        
        Args:
            user_query: Natural language query from user
            
        Returns:
            Tuple of (intent_type, keyword/subject)
            
        Intent types:
        - 'strategy': User wants to create a DeFi strategy
        - 'operation': User wants to perform a specific operation
        - 'question': User has a question about DeFi or workflows
        - 'modify': User wants to modify an existing workflow
        """
        
        prompt = f"""Analyze this DeFi workflow request and classify the intent.

User Query: "{user_query}"

Classify into one of these intents:
1. 'strategy' - User wants to create a complete DeFi strategy (e.g., "maximize yield", "dollar cost average")
2. 'operation' - User wants a specific operation (e.g., "swap ETH to USDC", "supply to Aave")
3. 'question' - User has a question about DeFi or workflows
4. 'modify' - User wants to modify an existing workflow

Extract the main keyword/subject from the query.

Respond in this exact format:
INTENT: <intent_type>
KEYWORD: <extracted_keyword>"""

        try:
            url = f"{self.base_url}/chat/completions"
            payload = {
                "model": "asi1-mini",
                "messages": [
                    {"role": "system", "content": "You are a DeFi workflow assistant that classifies user intents."},
                    {"role": "user", "content": prompt}
                ]
            }
            
            print(f"[DEBUG ASI:One] URL: {url}")
            print(f"[DEBUG ASI:One] Headers: {self.headers}")
            print(f"[DEBUG ASI:One] Payload: {payload}")
            
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            print(f"[DEBUG ASI:One] Response Status: {response.status_code}")
            print(f"[DEBUG ASI:One] Response Headers: {dict(response.headers)}")
            print(f"[DEBUG ASI:One] Response Text: {response.text[:500]}")
            
            response.raise_for_status()
            result = response.json()
            
            # ASI:One response format: choices[0].message.content
            content = result['choices'][0]['message']['content']
            
            # Parse response
            intent = "question"
            keyword = ""
            
            for line in content.split('\n'):
                line = line.strip()
                if line.startswith('INTENT:'):
                    intent = line.split(':', 1)[1].strip().lower()
                elif line.startswith('KEYWORD:'):
                    keyword = line.split(':', 1)[1].strip()
            
            return intent, keyword
            
        except Exception as e:
            print(f"Error calling ASI:One API: {e}")
            # Fallback to simple keyword extraction
            return self._fallback_intent_classification(user_query)
    
    def generate_workflow_from_intent(self, user_query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate a complete workflow JSON from natural language description.
        
        Args:
            user_query: User's workflow description
            context: Context from MeTTa knowledge graph (node types, strategies, token addresses, etc.)
            
        Returns:
            Workflow JSON structure
        """
        
        # Build node types description from context
        node_types_desc = ""
        if context and "node_types" in context:
            node_types_desc = "\nAvailable node types:\n"
            for nt in context["node_types"]:
                node_types_desc += f"- {nt['type']}: {nt['description']}\n"
        else:
            node_types_desc = "\nAvailable node types: trigger, swap, aave, transfer, condition, ai\n"
        
        # Build examples from strategies - safely handle empty or malformed data
        examples_desc = ""
        if context and "strategies" in context and context["strategies"]:
            # Filter out empty lists and non-dict items
            valid_strategies = [s for s in context["strategies"] if isinstance(s, dict) and 'description' in s and 'sequence' in s]
            if valid_strategies:
                examples_desc = "\nExample workflows:\n"
                for strat in valid_strategies[:3]:  # Show first 3
                    examples_desc += f"- {strat['description']}: {strat['sequence']}\n"
        
        # Build comprehensive token address mappings - always include this data
        token_mappings = """
TOKEN ADDRESS MAPPINGS BY NETWORK (ALWAYS USE THESE EXACT ADDRESSES):

BASESEPOLIA (Base Testnet - Chain ID: 84532):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0x4200000000000000000000000000000000000006 (18 decimals)
- USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e (6 decimals)

SEPOLIA (Ethereum Testnet - Chain ID: 11155111):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14 (18 decimals)
- USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 (6 decimals)
- DAI: 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357 (18 decimals)

BASE (Base Mainnet - Chain ID: 8453):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0x4200000000000000000000000000000000000006 (18 decimals)
- USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (6 decimals)

ETHEREUM (Ethereum Mainnet - Chain ID: 1):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (18 decimals)
- USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (6 decimals)
- USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7 (6 decimals)
- DAI: 0x6B175474E89094C44Da98b954EedeAC495271d0F (18 decimals)

ARBITRUM (Arbitrum One - Chain ID: 42161):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1 (18 decimals)
- USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 (6 decimals)

OPTIMISM (Optimism - Chain ID: 10):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0x4200000000000000000000000000000000000006 (18 decimals)
- USDC: 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85 (6 decimals)

POLYGON (Polygon - Chain ID: 137):
- MATIC: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WMATIC: 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270 (18 decimals)
- USDC: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 (6 decimals)

ARBITRUMSEPOLIA (Arbitrum Sepolia - Chain ID: 421614):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0x980B62Da83eFf3D4576C647993b0c1D7faf17c73 (18 decimals)

OPTIMISMSEPOLIA (Optimism Sepolia - Chain ID: 11155420):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (18 decimals)
- WETH: 0x4200000000000000000000000000000000000006 (18 decimals)

CHAIN NAME REFERENCE (use these EXACT names in "chain" field):
Mainnets: ethereum, base, arbitrum, optimism, polygon, avalanche, bnb, celo
Testnets: sepolia, basesepolia, arbitrumsepolia, optimismsepolia, avalanchefuji, polygonmumbai
"""
        
        # Add context data if available
        if context and "token_addresses" in context and len(context["token_addresses"]) > 0:
            token_mappings += "\n[Additional token addresses from context]:\n"
            for chain, tokens in list(context["token_addresses"].items())[:3]:
                token_mappings += f"\n{chain.upper()} (from RAG):\n"
                for token in tokens[:3]:
                    token_mappings += f"- {token['symbol']}: {token['address']}\n"
        
        prompt = f"""Create a DeFi workflow based on this request: "{user_query}"

{node_types_desc}
{examples_desc}

CRITICAL REQUIREMENTS:
1. ONLY generate the EXACT operations the user requested - DO NOT add extra helpful steps
2. If user asks for "swap X to Y", generate ONLY: trigger + swap nodes
3. If user asks for "swap and supply", generate: trigger + swap + aave nodes
4. DO NOT assume the user wants to transfer tokens unless explicitly asked
5. Use ONLY these exact node type values: trigger, swap, aave, transfer, condition, ai

FIELD NAMING REQUIREMENTS:
- Swap nodes MUST use: "fromToken" (address), "toToken" (address), "fromTokenDecimals", "chain", "protocol", "amount", "slippage"
- Aave nodes MUST use: "asset" (symbol like "USDC"), "amount", "action" (supply/borrow/withdraw/repay), "useAsCollateral", "chain"
- Transfer nodes MUST use: "token" (address), "to" (address), "amount", "chain"
  * CRITICAL: Transfer node "token" field MUST be the TOKEN ADDRESS being transferred (NOT the symbol)
  * CRITICAL: Transfer node MUST include "chain" field with the same chain as previous nodes
  * CRITICAL: Transfer node "to" field MUST be the recipient wallet address from user query
- DO NOT use "tokenIn" or "tokenOut" - use "fromToken" and "toToken" instead
- DO NOT use "recipient" - use "to" for transfer nodes

CHAIN NAME PARSING RULES:
1. User mentions "base sepolia", "basesepolia", "base-sepolia", "base testnet" → use "basesepolia"
2. User mentions "sepolia" alone → use "sepolia" (Ethereum Sepolia testnet, NOT Base Sepolia)
3. User mentions "base" alone, "base mainnet" → use "base"
4. User mentions "ethereum", "eth mainnet" → use "ethereum"
5. User mentions "arbitrum sepolia" → use "arbitrumsepolia"
6. User mentions "optimism sepolia" → use "optimismsepolia"
7. Parse chain BEFORE looking up token addresses
8. Default to "basesepolia" ONLY if absolutely NO chain is mentioned

SUPPORTED CHAIN NAMES (use these EXACT strings in "chain" field):
Mainnets: ethereum, base, arbitrum, optimism, polygon, avalanche, bnb, celo
Testnets: sepolia, basesepolia, arbitrumsepolia, optimismsepolia, avalanchefuji, polygonmumbai

CRITICAL: "sepolia" and "basesepolia" are DIFFERENT chains with DIFFERENT token addresses!

AMOUNT FIELD REQUIREMENTS:
- If a node (swap, aave, transfer) comes AFTER another node that produces an output amount, leave the "amount" field as an empty string ""
- The backend will automatically infer the amount from the previous node's output
- ONLY set a specific amount value if the user explicitly specifies an amount AND it's the first operation in the chain
- Examples:
  * "swap 100 USDC to ETH then transfer to 0x123..." -> swap amount: "100", transfer amount: "" (inferred from swap output)
  * "swap 0.01 ETH to USDC then transfer to 0x123..." -> swap amount: "0.01", transfer amount: "" (inferred from swap output)
  * "swap ETH to USDC then supply to Aave" -> swap amount: "", aave amount: "" (both inferred from user's wallet/previous outputs)

{token_mappings}

TOKEN ADDRESS LOOKUP - CRITICAL:
For each token symbol mentioned (ETH, USDC, USDT, WETH, DAI, etc.), you MUST:
1. Identify the target chain from user query FIRST
   - "base sepolia", "basesepolia", "base-sepolia" → chain = "basesepolia"
   - "sepolia" alone → chain = "sepolia" (Ethereum Sepolia, NOT Base Sepolia!)
   - "base" alone → chain = "base" (mainnet)
2. Look up the EXACT token address for that symbol on that SPECIFIC chain from TOKEN ADDRESS MAPPINGS above
3. DO NOT mix addresses from different chains - each chain has different addresses!
4. For transfer nodes after a swap: use the swap's toToken address as the transfer token address

EXAMPLES OF CORRECT CHAIN & TOKEN MAPPING:

Example 1 - Base Sepolia (CORRECT):
User: "swap eth to usdc on base sepolia"
Step 1: Parse chain → "base sepolia" → "basesepolia"
Step 2: Look up ETH on basesepolia → 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
Step 3: Look up USDC on basesepolia → 0x036CbD53842c5426634e7929541eC2318f3dCF7e
Result: chain="basesepolia", fromToken=ETH address, toToken=USDC basesepolia address

Example 2 - Sepolia (DIFFERENT FROM BASE SEPOLIA):
User: "swap eth to usdc on sepolia"
Step 1: Parse chain → "sepolia" → "sepolia"  
Step 2: Look up USDC on sepolia → 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
Result: chain="sepolia", toToken=USDC sepolia address (NOT basesepolia USDC!)

COMMON MISTAKE TO AVOID:
❌ WRONG: User says "base sepolia" but you use sepolia USDC address (0x1c7D...)
✅ RIGHT: User says "base sepolia" so use basesepolia USDC address (0x036C...)

SWAP + TRANSFER EXAMPLE:
User: "swap 0.01 eth to usdc and then transfer it to 0x0fCe963885b15a12832813798980bDadc9744705 on base sepolia"
Chain parsing: "base sepolia" → "basesepolia"
Token lookup: USDC on basesepolia → 0x036CbD53842c5426634e7929541eC2318f3dCF7e (NOT sepolia USDC 0x94a9...)

Correct output:
{{
  "nodes": [
    {{
      "id": "node-1",
      "type": "trigger",
      "data": {{
        "label": "Trigger",
        "config": {{"triggerType": "manual"}}
      }},
      "position": {{"x": 100, "y": 100}}
    }},
    {{
      "id": "node-2",
      "type": "swap",
      "data": {{
        "label": "Swap ETH to USDC",
        "config": {{
          "fromToken": "0x4200000000000000000000000000000000000006",
          "toToken": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "fromTokenDecimals": "18",
          "amount": "0.01",
          "chain": "basesepolia",
          "protocol": "uniswap",
          "slippage": "1"
        }}
      }},
      "position": {{"x": 300, "y": 100}}
    }},
    {{
      "id": "node-3",
      "type": "transfer",
      "data": {{
        "label": "Transfer USDC",
        "config": {{
          "token": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "to": "0x0fCe963885b15a12832813798980bDadc9744705",
          "amount": "",
          "chain": "basesepolia"
        }}
      }},
      "position": {{"x": 500, "y": 100}}
    }}
  ],
  "edges": [
    {{
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "sourceHandle": "output",
      "targetHandle": "input"
    }},
    {{
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3",
      "sourceHandle": "output",
      "targetHandle": "input"
    }}
  ]
}}

REQUIRED WORKFLOW STRUCTURE:
- USDT: 0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2
- DAI: 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb
- WETH: 0x4200000000000000000000000000000000000006

6. Each node MUST have:
   - id: string (e.g., "node-1", "node-2")
   - type: string (MUST be one of: trigger, swap, aave, transfer, condition, ai)
   - data: object with "label" (string) and "config" (object)
   - position: object with "x" and "y" (numbers)
7. Each edge MUST have:
   - id: string (e.g., "edge-1")
   - source: string (source node id)
   - target: string (target node id)
   - sourceHandle: "output"
   - targetHandle: "input"
8. ALWAYS start with a "trigger" node
9. Do NOT use brackets [] or quotes in type field - use plain string values

Example valid workflow:
{{
  "nodes": [
    {{
      "id": "node-1",
      "type": "trigger",
      "data": {{
        "label": "Trigger",
        "config": {{"triggerType": "manual"}}
      }},
      "position": {{"x": 100, "y": 100}}
    }},
    {{
      "id": "node-2",
      "type": "swap",
      "data": {{
        "label": "Swap ETH to USDC",
        "config": {{
          "protocol": "uniswap",
          "fromToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          "toToken": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          "fromTokenDecimals": "18",
          "amount": "",
          "slippage": "0.5",
          "chain": "basesepolia"
        }}
      }},
      "position": {{"x": 350, "y": 100}}
    }}
  ],
  "edges": [
    {{
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "sourceHandle": "output",
      "targetHandle": "input"
    }}
  ]
}}

Respond with ONLY valid JSON, no markdown code blocks, no explanations."""

        try:
            # Log the prompt for debugging
            import sys
            print(f"🔍 [ASI Client v{CLIENT_VERSION}] Generating workflow for query: {user_query}", flush=True)
            print(f"📊 [ASI Client v{CLIENT_VERSION}] Prompt length: {len(prompt)} characters", flush=True)
            print(f"🗺️  [ASI Client v{CLIENT_VERSION}] Chain context included: {'token_addresses' in context if context else 'No context'}", flush=True)
            if context and 'token_addresses' in context:
                chains = list(context['token_addresses'].keys())
                print(f"🌐 [ASI Client v{CLIENT_VERSION}] Available chains: {', '.join(chains[:5])}", flush=True)
            
            # Debug: Print portion of prompt with token mappings
            if "BASESEPOLIA" in prompt:
                print(f"✅ [ASI] Prompt includes BASESEPOLIA token mappings", flush=True)
                # Find and print the USDC line for basesepolia
                for line in prompt.split('\n'):
                    if 'basesepolia' in line.lower() and 'usdc' in line.lower():
                        print(f"   📍 {line.strip()}", flush=True)
                        break
            else:
                print(f"❌ [ASI] WARNING: Prompt missing BASESEPOLIA token mappings!", flush=True)
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "asi1-mini",
                    "messages": [
                        {"role": "system", "content": """You are a DeFi workflow architect. Generate ONLY what the user explicitly requests. 

CRITICAL CHAIN PARSING RULES - MUST FOLLOW EXACTLY:
- "base sepolia", "basesepolia", or "base-sepolia" in user query → MUST use chain value "basesepolia"
- "sepolia" alone → use "sepolia" (Ethereum Sepolia, NOT Base Sepolia)
- These are DIFFERENT chains with DIFFERENT token addresses

CRITICAL TOKEN ADDRESS RULES - MUST FOLLOW EXACTLY:
- Look up token addresses in the TOKEN ADDRESS MAPPINGS section for the SPECIFIC chain
- Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- Sepolia USDC: 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8
- DO NOT mix addresses from different chains

CRITICAL TRANSFER NODE RULES - MUST FOLLOW EXACTLY:
- Transfer nodes MUST have: "token" (token ADDRESS not symbol), "to" (recipient address), "chain", "amount"
- After a swap, transfer node "token" field MUST use the swap's "toToken" address
- Transfer node "to" field MUST be the recipient wallet address from user query

Output valid JSON only. Follow the examples EXACTLY."""},
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            print(f"📦 [ASI Client v{CLIENT_VERSION}] Full API response: {result}", flush=True)
            
            # ASI:One response format
            content = result['choices'][0]['message']['content']
            
            print(f"🤖 [ASI Client v{CLIENT_VERSION}] Raw AI response (first 500 chars): {content[:500]}", flush=True)
            
            # Extract JSON from response (might be wrapped in code blocks)
            import json
            import re
            
            # Try to find JSON in code blocks
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
            if json_match:
                workflow_json = json.loads(json_match.group(1))
            else:
                # Try direct JSON parse
                workflow_json = json.loads(content)
            
            # Log what chain was generated
            if workflow_json and 'nodes' in workflow_json:
                for node in workflow_json['nodes']:
                    if node.get('type') == 'swap' and 'data' in node and 'config' in node['data']:
                        chain = node['data']['config'].get('chain', 'NOT SET')
                        toToken = node['data']['config'].get('toToken', 'NOT SET')
                        print(f"⚠️  [ASI Client v{CLIENT_VERSION}] Generated swap node: chain={chain}, toToken={toToken[:20]}...", flush=True)
            
            return workflow_json
            
        except json.JSONDecodeError as e:
            print(f"❌ [ASI Client v{CLIENT_VERSION}] JSON decode error: {e}", flush=True)
            print(f"   Content was: {content[:200] if 'content' in locals() else 'N/A'}", flush=True)
            return self._fallback_workflow()
        except KeyError as e:
            print(f"❌ [ASI Client v{CLIENT_VERSION}] KeyError accessing response: {e}", flush=True)
            print(f"   Result keys: {result.keys() if 'result' in locals() else 'N/A'}", flush=True)
            return self._fallback_workflow()
        except Exception as e:
            print(f"❌ [ASI Client v{CLIENT_VERSION}] Error generating workflow: {e}", flush=True)
            import traceback
            print(f"   Traceback: {traceback.format_exc()}", flush=True)
            return self._fallback_workflow()
    
    def explain_workflow(self, workflow_json: Dict[str, Any]) -> str:
        """
        Generate a human-readable explanation of a workflow.
        
        Args:
            workflow_json: The workflow structure
            
        Returns:
            Plain English explanation
        """
        
        prompt = f"""Explain this DeFi workflow in simple terms.

Workflow:
{workflow_json}

Provide a clear, concise explanation of what this workflow does,
in 2-3 sentences. Focus on the user's goal and the steps taken."""

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "asi1-mini",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=20
            )
            
            response.raise_for_status()
            result = response.json()
            
            return result['choices'][0]['message']['content']
            
        except Exception as e:
            print(f"Error explaining workflow: {e}")
            return "This workflow automates your DeFi operations."
    
    def query_with_mcp_tools(self, 
                             prompt: str, 
                             mcp_tools: list = None,
                             context: str = None,
                             system_prompt: str = None,
                             temperature: float = 0.7,
                             max_tokens: int = 500) -> Dict[str, Any]:
        """
        Query ASI:One with MCP tools available for function calling.
        
        Args:
            prompt: User's query/prompt
            mcp_tools: List of MCP tool definitions in OpenAI function calling format
            context: Additional context (e.g., previous workflow results)
            system_prompt: System instructions for the AI
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens in response
            
        Returns:
            Dictionary with response text and any tool calls made
        """
        
        if system_prompt is None:
            system_prompt = "You are a helpful DeFi analysis assistant with access to blockchain data tools."
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if context:
            messages.append({
                "role": "system", 
                "content": f"Context from previous operations:\n{context}"
            })
        
        messages.append({"role": "user", "content": prompt})
        
        request_body = {
            "model": "asi1-mini",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        # Add tools if provided
        if mcp_tools and len(mcp_tools) > 0:
            request_body["tools"] = mcp_tools
            request_body["tool_choice"] = "auto"  # Let AI decide when to use tools
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=request_body,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            message = result['choices'][0]['message']
            
            return {
                "content": message.get('content', ''),
                "tool_calls": message.get('tool_calls', []),
                "finish_reason": result['choices'][0].get('finish_reason', 'stop')
            }
            
        except Exception as e:
            print(f"Error querying ASI:One with MCP tools: {e}")
            return {
                "content": "I apologize, but I encountered an error processing your request.",
                "tool_calls": [],
                "finish_reason": "error"
            }
    
    def query_agent_with_retry(self, 
                                prompt: str, 
                                agent_address: str,
                                max_wait_seconds: int = 30,
                                poll_interval: float = 1.0) -> Dict[str, Any]:
        """
        Query an agent via ASI:One and wait for the complete response.
        
        This handles the asynchronous nature of agent communication by:
        1. Sending the query to ASI:One
        2. Checking if it delegated to an agent
        3. Polling for the agent's response with timeout
        
        Args:
            prompt: User's query
            agent_address: Target agent address (e.g., Blockscout agent)
            max_wait_seconds: Maximum time to wait for response (default 30s)
            poll_interval: Time between poll attempts in seconds (default 1.0s)
            
        Returns:
            Dictionary with the final response from the agent
        """
        import time
        
        # First, send the query to ASI:One
        messages = [
            {"role": "system", "content": "You are a helpful blockchain data assistant. When asked about blockchain transactions or addresses, use the available agent tools to fetch accurate data."},
            {"role": "user", "content": prompt}
        ]
        
        request_body = {
            "model": "asi1-mini",
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 1000
        }
        
        try:
            # Initial query
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=request_body,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            initial_content = result['choices'][0]['message'].get('content', '')
            
            # Check if ASI:One is delegating to an agent (indicated by messages like "One moment...")
            if "one moment" in initial_content.lower() or "checking" in initial_content.lower() or "let me" in initial_content.lower():
                print(f"🔄 ASI:One delegating to agent, waiting for response...")
                
                # Poll for the complete response
                start_time = time.time()
                attempts = 0
                
                while (time.time() - start_time) < max_wait_seconds:
                    attempts += 1
                    time.sleep(poll_interval)
                    
                    # Re-query to check if response is complete
                    # We can add the initial response to conversation history
                    poll_messages = messages + [
                        {"role": "assistant", "content": initial_content},
                        {"role": "user", "content": "Please provide the complete response."}
                    ]
                    
                    poll_response = requests.post(
                        f"{self.base_url}/chat/completions",
                        headers=self.headers,
                        json={
                            **request_body,
                            "messages": poll_messages
                        },
                        timeout=30
                    )
                    
                    poll_response.raise_for_status()
                    poll_result = poll_response.json()
                    poll_content = poll_result['choices'][0]['message'].get('content', '')
                    
                    # Check if we got actual data (not another "waiting" message)
                    if poll_content and not any(wait_word in poll_content.lower() for wait_word in ["one moment", "checking", "please wait", "let me"]):
                        # Check if response contains actual data (transaction info, addresses, etc.)
                        if any(indicator in poll_content.lower() for indicator in ["transaction", "address", "block", "hash", "0x", "eth", "gas", "value"]):
                            print(f"✅ Got complete response after {attempts} attempts ({time.time() - start_time:.1f}s)")
                            return {
                                "content": poll_content,
                                "agent_address": agent_address,
                                "response_time": time.time() - start_time,
                                "success": True
                            }
                
                # Timeout reached
                print(f"⏱️  Timeout after {max_wait_seconds}s, returning partial response")
                return {
                    "content": initial_content + "\n\n(Note: The agent response took longer than expected. Please try again.)",
                    "agent_address": agent_address,
                    "response_time": max_wait_seconds,
                    "success": False,
                    "error": "timeout"
                }
            else:
                # Got complete response immediately
                return {
                    "content": initial_content,
                    "success": True
                }
                
        except Exception as e:
            print(f"❌ Error querying agent: {e}")
            return {
                "content": f"I encountered an error while processing your request: {str(e)}",
                "success": False,
                "error": str(e)
            }
    
    def _fallback_intent_classification(self, query: str) -> Tuple[str, str]:
        """Fallback intent classification using simple keyword matching."""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['yield', 'maximize', 'earn', 'strategy']):
            return 'strategy', 'maximize_yield'
        elif any(word in query_lower for word in ['swap', 'exchange', 'trade']):
            return 'operation', 'swap_tokens'
        elif any(word in query_lower for word in ['supply', 'deposit', 'lend', 'aave']):
            return 'operation', 'supply_to_aave'
        elif any(word in query_lower for word in ['?', 'how', 'what', 'why']):
            return 'question', query_lower.split()[0] if query_lower.split() else 'general'
        else:
            return 'strategy', 'general'
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context dictionary as readable string."""
        lines = []
        for key, value in context.items():
            if isinstance(value, list):
                lines.append(f"{key}: {', '.join(str(v) for v in value)}")
            else:
                lines.append(f"{key}: {value}")
        return '\n'.join(lines)
    
    def _fallback_workflow(self) -> Dict[str, Any]:
        """Generate a simple fallback workflow."""
        return {
            "nodes": [
                {
                    "id": "node-1",
                    "type": "trigger",
                    "data": {
                        "label": "Trigger",
                        "config": {"triggerType": "manual"}
                    },
                    "position": {"x": 100, "y": 100}
                }
            ],
            "edges": []
        }


if __name__ == "__main__":
    # Test the ASI:One client
    client = ASIOneClient()
    
    print("\n📊 Testing ASI:One Client:\n")
    
    # Test intent classification
    test_queries = [
        "I want to maximize my USDC yield",
        "Swap 100 USDC to ETH",
        "How do I use Aave?",
        "Create a stop loss strategy for my ETH"
    ]
    
    for query in test_queries:
        intent, keyword = client.get_intent_and_keyword(query)
        print(f"Query: '{query}'")
        print(f"  → Intent: {intent}, Keyword: {keyword}\n")
