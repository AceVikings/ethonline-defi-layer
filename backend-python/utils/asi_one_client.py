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
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "gpt-4",
                    "messages": [
                        {"role": "system", "content": "You are a DeFi workflow assistant that classifies user intents."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 150
                },
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
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
            context: Optional context (available strategies, nodes, etc.)
            
        Returns:
            Workflow JSON structure
        """
        
        context_str = ""
        if context:
            context_str = f"\n\nAvailable context:\n{self._format_context(context)}"
        
        prompt = f"""Create a DeFi workflow based on this request.

User Request: "{user_query}"{context_str}

Available node types:
- trigger: Start workflow (manual or scheduled)
- swap: Exchange tokens (Uniswap or 1inch)
- aave: Aave V3 operations (supply, borrow, withdraw, repay)
- transfer: Send tokens to address
- condition: If/else branching
- ai: AI-powered decision making

Generate a valid workflow JSON with nodes and edges.
Include proper configuration for each node.

Respond with ONLY valid JSON, no explanation."""

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "gpt-4",
                    "messages": [
                        {"role": "system", "content": "You are a DeFi workflow architect. Generate valid JSON workflows."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.5,
                    "max_tokens": 1500
                },
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
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
                    "model": "gpt-4",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 200
                },
                timeout=20
            )
            
            response.raise_for_status()
            result = response.json()
            
            return result['choices'][0]['message']['content']
            
        except Exception as e:
            print(f"Error explaining workflow: {e}")
            return "This workflow automates your DeFi operations."
    
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
