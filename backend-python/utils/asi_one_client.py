"""
ASI:One API Client

This module provides integration with ASI:One for LLM-powered
intent classification and natural language processing.
"""

import os
import requests
from typing import Dict, Tuple, Any


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
            context: Context from MeTTa knowledge graph (node types, strategies, etc.)
            
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
        
        # Build examples from strategies
        examples_desc = ""
        if context and "strategies" in context:
            examples_desc = "\nExample workflows:\n"
            for strat in context["strategies"][:3]:  # Show first 3
                examples_desc += f"- {strat['description']}: {strat['sequence']}\n"
        
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
- DO NOT use "tokenIn" or "tokenOut" - use "fromToken" and "toToken" instead

TOKEN ADDRESS MAPPINGS (Base network):
- ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
- USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
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
          "chain": "base"
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
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "asi1-mini",
                    "messages": [
                        {"role": "system", "content": "You are a DeFi workflow architect. Generate ONLY what the user explicitly requests. Do NOT add extra helpful steps like transfers unless specifically asked. Output valid JSON only."},
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            # ASI:One response format
            content = result['choices'][0]['message']['content']
            
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
            
            return workflow_json
            
        except Exception as e:
            print(f"Error generating workflow: {e}")
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
