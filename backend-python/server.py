"""
Flask Server - Bridge between Python agents and Node.js backend

This server provides REST API endpoints for the Node.js backend to
interact with Python uAgents and MeTTa knowledge graph.
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

# Import our modules
from metta.knowledge import get_metta_instance
from metta.defi_rag import DeFiWorkflowRAG
from utils.asi_one_client import ASIOneClient

# Load environment variables
load_dotenv()

# Token address mappings for Base network
TOKEN_ADDRESSES = {
    "base": {
        "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",  # Native ETH
        "WETH": "0x4200000000000000000000000000000000000006",
        "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "USDT": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
        "DAI": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        "WBTC": "0x",  # Add if needed
    },
    "ethereum": {
        "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    "sepolia": {
        "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "WETH": "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        "USDC": "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
    },
    "basesepolia": {
        "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "WETH": "0x4200000000000000000000000000000000000006",
        "USDC": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    }
}

def get_token_address(symbol: str, chain: str = "base") -> str:
    """Convert token symbol to address for the given chain"""
    chain_tokens = TOKEN_ADDRESSES.get(chain, TOKEN_ADDRESSES["base"])
    return chain_tokens.get(symbol.upper(), "")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend

# Initialize MeTTa and ASI:One
print("🧠 Initializing MeTTa Knowledge Graph...")
metta = get_metta_instance()
rag = DeFiWorkflowRAG(metta)

print("🤖 Initializing ASI:One Client...")
asi_client = ASIOneClient()

print(f"""
✅ Flask Server initialized!
   Port: {os.getenv('FLASK_PORT', 8080)}
   Ready to serve requests! 🚀
""")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "DeFi Workflow Python Backend",
        "metta_loaded": metta is not None,
        "asi_one_connected": asi_client is not None
    })


@app.route('/api/workflow/generate', methods=['POST'])
def generate_workflow():
    """
    Generate a workflow from natural language description.
    
    Request body:
    {
        "query": "I want to maximize my USDC yield",
        "userAddress": "0x..."  // optional
    }
    
    Response:
    {
        "success": true,
        "workflow": { nodes: [...], edges: [...] },
        "explanation": "This workflow...",
        "strategy": "maximize_yield_usdc"
    }
    """
    
    try:
        data = request.get_json()
        user_query = data.get('query', '')
        user_address = data.get('userAddress', '')
        
        if not user_query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        print(f"📝 Workflow generation request: '{user_query}'")
        
        # Step 1: Classify intent
        print("🔍 Classifying intent...")
        intent, keyword = asi_client.get_intent_and_keyword(user_query)
        print(f"   Intent: {intent}, Keyword: {keyword}")
        
        # Step 2: Try ASI:One first for AI-powered generation
        print("🤖 Generating with ASI:One AI...")
        
        workflow_json = None
        strategy_used = ""
        
        try:
            asi_result = asi_client.generate_workflow_from_intent(user_query, {
                'intent': intent,
                'keyword': keyword
            })
            
            if asi_result and asi_result.get('nodes'):
                workflow_json = asi_result
                print(f"✅ Generated workflow with {len(workflow_json.get('nodes', []))} nodes from ASI:One")
        except Exception as e:
            print(f"[ASI] Error generating with ASI:One: {e}")
            workflow_json = None
        
        # Step 3: Fallback to rule-based generation
        if not workflow_json:
            print("📚 Falling back to rule-based generation...")
            workflow_json = generate_workflow_from_query(user_query, intent, keyword)
            
            if workflow_json and workflow_json.get('nodes'):
                print(f"✅ Generated workflow with {len(workflow_json.get('nodes', []))} nodes from rules")
            else:
                workflow_json = None  # Reset if empty
        
        # Step 4: Try knowledge graph strategies if still no workflow
        if not workflow_json and intent == "strategy":
            print("📚 Querying knowledge graph for strategy...")
            strategy_result = rag.find_strategy_for_intent(user_query)
            print(f"   Strategy result: {strategy_result}")
            
            if strategy_result:
                strategy_used = keyword
                workflow_json = generate_workflow_from_strategy(strategy_result, user_query)
        
        # Try operation lookup if still no workflow
        if not workflow_json and intent == "operation":
            print("📚 Querying knowledge graph for operation...")
            operation_result = rag.query_operation(keyword)
            print(f"   Operation result: {operation_result}")
            
            if operation_result:
                workflow_json = generate_workflow_from_operation(operation_result, user_query)
        
        # Step 6: Generate explanation
        print("💬 Generating explanation...")
        
        if not workflow_json:
            return jsonify({
                "error": "Failed to generate workflow",
                "message": "Could not generate a valid workflow from your request. Please try rephrasing."
            }), 400
        
        explanation = asi_client.explain_workflow(workflow_json)
        
        print("✅ Workflow generated successfully!")
        
        return jsonify({
            "success": True,
            "workflow": workflow_json,
            "explanation": explanation,
            "strategy": strategy_used,
            "intent": intent,
            "keyword": keyword
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/knowledge/query', methods=['POST'])
def query_knowledge():
    """
    Query the MeTTa knowledge graph.
    
    Request body:
    {
        "type": "capability" | "strategy" | "protocol" | "solution",
        "query": "swap" | "maximize_yield_usdc" | etc.
    }
    """
    
    try:
        data = request.get_json()
        query_type = data.get('type', '')
        query = data.get('query', '')
        
        if not query_type or not query:
            return jsonify({
                "success": False,
                "error": "Both type and query are required"
            }), 400
        
        result = None
        
        if query_type == "capability":
            result = rag.query_capability(query)
        elif query_type == "strategy" or query_type == "strategies":
            # Support both singular and plural
            if query:
                result = rag.query_strategy(query)
            else:
                result = rag.query_all_strategies()
        elif query_type == "protocol" or query_type == "protocols":
            result = rag.query_protocols(query if query else None)
        elif query_type == "solution":
            result = rag.query_solution(query)
        elif query_type == "consideration":
            result = rag.query_consideration(query)
        else:
            return jsonify({
                "success": False,
                "error": f"Unknown query type: {query_type}. Valid types: capability, strategy/strategies, protocol/protocols, solution, consideration"
            }), 400
        
        return jsonify({
            "success": True,
            "result": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/agents/search', methods=['POST'])
def search_agents():
    """
    Search for agents on Agentverse.
    
    This will be used by the uAgents node in the frontend.
    """
    
    try:
        data = request.get_json()
        search_query = data.get('query', '')
        semantic = data.get('semantic', False)
        
        # TODO: Implement Agentverse search using API
        # For now, return mock data
        
        mock_agents = [
            {
                "address": "agent1qf7aggz...",
                "name": "Price Oracle Agent",
                "description": "Provides real-time cryptocurrency price data",
                "tags": ["price", "oracle", "data"],
                "interactions": 1250
            },
            {
                "address": "agent1xyz123...",
                "name": "Risk Assessment Agent",
                "description": "Analyzes DeFi protocol risks and provides safety scores",
                "tags": ["risk", "analysis", "defi"],
                "interactions": 890
            }
        ]
        
        return jsonify({
            "success": True,
            "agents": mock_agents
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/asi/classify', methods=['POST'])
def classify_intent():
    """
    Classify user intent using ASI:One.
    
    Request body:
    {
        "text": "I want to swap ETH to USDC and earn yield"
    }
    
    Response:
    {
        "success": true,
        "intent": "strategy",
        "keywords": ["swap", "yield"],
        "confidence": 0.95
    }
    """
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({
                "success": False,
                "error": "Text is required"
            }), 400
        
        # Use ASI:One client for intent classification
        result = asi_client.classify_intent(text)
        
        return jsonify({
            "success": True,
            **result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/knowledge/strategies', methods=['GET'])
def get_strategies():
    """
    Get all available DeFi strategies from the knowledge graph.
    
    Response:
    {
        "success": true,
        "strategies": [...]
    }
    """
    
    try:
        strategies = rag.query_all_strategies()
        
        return jsonify({
            "success": True,
            "strategies": strategies
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


def generate_workflow_from_query(user_query: str, intent: str, keyword: str) -> dict:
    """
    Generate workflow from user query using simple pattern matching.
    This is the primary workflow generator that doesn't rely on external APIs.
    """
    query_lower = user_query.lower()
    nodes = []
    edges = []
    
    # Always start with a trigger
    nodes.append({
        "id": "node-1",
        "type": "trigger",
        "data": {
            "label": "Trigger",
            "config": {"triggerType": "manual"}
        },
        "position": {"x": 100, "y": 100}
    })
    
    node_counter = 2
    x_pos = 350
    y_pos = 100
    x_spacing = 250
    
    # Detect swap operation
    if any(word in query_lower for word in ['swap', 'exchange', 'trade', 'convert']):
        # Extract tokens
        token_in = "ETH"
        token_out = "USDC"
        
        if "eth" in query_lower and "usdc" in query_lower:
            if query_lower.index("eth") < query_lower.index("usdc"):
                token_in, token_out = "ETH", "USDC"
            else:
                token_in, token_out = "USDC", "ETH"
        elif "usdc" in query_lower and "eth" in query_lower:
            if query_lower.index("usdc") < query_lower.index("eth"):
                token_in, token_out = "USDC", "ETH"
            else:
                token_in, token_out = "ETH", "USDC"
        elif "dai" in query_lower:
            token_out = "DAI"
        elif "usdt" in query_lower:
            token_out = "USDT"
        
        # Extract chain if mentioned
        chain = "base"
        if "ethereum" in query_lower or "mainnet" in query_lower:
            chain = "ethereum"
        elif "sepolia" in query_lower:
            chain = "sepolia"
        elif "base" in query_lower:
            chain = "base"
        
        # Get token addresses
        from_token_address = get_token_address(token_in, chain)
        to_token_address = get_token_address(token_out, chain)
        
        swap_node = {
            "id": f"node-{node_counter}",
            "type": "swap",
            "data": {
                "label": f"Swap {token_in} to {token_out}",
                "config": {
                    "protocol": "uniswap",
                    "fromToken": from_token_address,
                    "toToken": to_token_address,
                    "fromTokenDecimals": "18" if token_in == "ETH" else "6",
                    "amount": "",
                    "slippage": "0.5",
                    "chain": chain,
                    # Output metadata for downstream nodes
                    "_outputToken": token_out,
                    "_outputSymbol": token_out
                }
            },
            "position": {"x": x_pos, "y": y_pos}
        }
        nodes.append(swap_node)
        
        # Connect trigger to swap
        edges.append({
            "id": f"edge-{node_counter-1}",
            "source": f"node-{node_counter-1}",
            "target": f"node-{node_counter}",
            "sourceHandle": "output",
            "targetHandle": "input"
        })
        
        node_counter += 1
        x_pos += x_spacing
    
    # Detect Aave operations
    if any(word in query_lower for word in ['supply', 'lend', 'deposit', 'aave']):
        action = "supply"
        asset = "USDC"
        
        # Determine asset from previous swap or query
        if nodes and len(nodes) > 1 and nodes[-1]["type"] == "swap":
            asset = nodes[-1]["data"]["config"].get("_outputSymbol", "USDC")
        elif "eth" in query_lower:
            asset = "ETH"
        elif "dai" in query_lower:
            asset = "DAI"
        elif "usdt" in query_lower:
            asset = "USDT"
        
        aave_node = {
            "id": f"node-{node_counter}",
            "type": "aave",
            "data": {
                "label": f"Supply {asset} to Aave",
                "config": {
                    "action": action,
                    "asset": asset,
                    "amount": "",
                    "chain": nodes[-1]["data"]["config"].get("chain", "base") if nodes else "base",
                    "useAsCollateral": True,
                    # Output metadata
                    "_outputToken": f"a{asset}",  # aToken received
                    "_outputSymbol": f"a{asset}"
                }
            },
            "position": {"x": x_pos, "y": y_pos}
        }
        nodes.append(aave_node)
        
        # Connect to previous node
        edges.append({
            "id": f"edge-{node_counter-1}",
            "source": f"node-{node_counter-1}",
            "target": f"node-{node_counter}",
            "sourceHandle": "output",
            "targetHandle": "input"
        })
        
        node_counter += 1
        x_pos += x_spacing
    
    # Detect borrow operations
    if any(word in query_lower for word in ['borrow']):
        asset = "USDC"
        
        if "eth" in query_lower:
            asset = "ETH"
        elif "dai" in query_lower:
            asset = "DAI"
        elif "usdt" in query_lower:
            asset = "USDT"
        
        borrow_node = {
            "id": f"node-{node_counter}",
            "type": "aave",
            "data": {
                "label": f"Borrow {asset}",
                "config": {
                    "action": "borrow",
                    "asset": asset,
                    "amount": "",
                    "chain": "base"
                }
            },
            "position": {"x": x_pos, "y": y_pos}
        }
        nodes.append(borrow_node)
        
        edges.append({
            "id": f"edge-{node_counter-1}",
            "source": f"node-{node_counter-1}",
            "target": f"node-{node_counter}",
            "sourceHandle": "output",
            "targetHandle": "input"
        })
        
        node_counter += 1
        x_pos += x_spacing
    
    # Detect transfer operations
    if any(word in query_lower for word in ['send', 'transfer']):
        token = "USDC"
        
        if "eth" in query_lower:
            token = "ETH"
        elif "dai" in query_lower:
            token = "DAI"
        elif "usdt" in query_lower:
            token = "USDT"
        
        transfer_node = {
            "id": f"node-{node_counter}",
            "type": "transfer",
            "data": {
                "label": f"Transfer {token}",
                "config": {
                    "token": token,
                    "recipient": "",
                    "amount": ""
                }
            },
            "position": {"x": x_pos, "y": y_pos}
        }
        nodes.append(transfer_node)
        
        edges.append({
            "id": f"edge-{node_counter-1}",
            "source": f"node-{node_counter-1}",
            "target": f"node-{node_counter}",
            "sourceHandle": "output",
            "targetHandle": "input"
        })
    
    # Return workflow if we have more than just a trigger
    if len(nodes) > 1:
        return {
            "nodes": nodes,
            "edges": edges
        }
    
    return None


@app.route('/api/knowledge/nodes', methods=['GET'])
def get_nodes():
    """
    Get all available node types and their capabilities.
    
    Response:
    {
        "success": true,
        "nodes": [...]
    }
    """
    
    try:
        node_types = ["trigger", "swap", "aave", "transfer", "condition", "ai"]
        nodes = []
        
        for node_type in node_types:
            capabilities = rag.query_capability(node_type)
            nodes.append({
                "type": node_type,
                "capabilities": capabilities
            })
        
        return jsonify({
            "success": True,
            "nodes": nodes
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


def generate_workflow_from_strategy(strategy_result, user_query):
    """Generate workflow JSON from strategy using knowledge graph"""
    
    if not strategy_result or not strategy_result[0]:
        return None
    
    # Get the node sequence from strategy
    node_sequence = str(strategy_result[0])
    
    # Clean up the sequence - remove brackets, quotes, and extra whitespace
    # Handle formats like: '["trigger -> swap"]', '"trigger -> swap"', or 'trigger -> swap'
    import re
    node_sequence = re.sub(r'[\[\]"\']', '', node_sequence).strip()
    
    print(f"[Debug] Cleaned node sequence: '{node_sequence}'")
    
    # Parse node sequence (format: "trigger -> swap -> aave")
    node_types = [n.strip() for n in node_sequence.split('->')]
    
    print(f"[Debug] Parsed node types: {node_types}")
    
    # Get all available node types from knowledge graph to validate
    all_node_types = rag.get_all_node_types()
    valid_types = {nt["type"] for nt in all_node_types}
    
    # Fallback to hardcoded types if knowledge graph is empty
    if not valid_types:
        valid_types = {"trigger", "swap", "aave", "transfer", "condition", "ai"}
    
    print(f"[Debug] Valid node types: {valid_types}")
    
    nodes = []
    edges = []
    
    x_pos = 100
    y_pos = 100
    x_spacing = 250
    
    for i, node_type in enumerate(node_types):
        # Clean node type (remove any prefix/suffix from MeTTa)
        clean_type = node_type.lower().strip()
        
        # Validate node type exists
        if clean_type not in valid_types:
            print(f"[Warning] Unknown node type: {clean_type}, skipping...")
            continue
        
        node_id = f"node-{i+1}"
        
        # Get default config from knowledge graph
        config = rag.get_node_config(clean_type)
        
        # Get node metadata
        node_info = next((nt for nt in all_node_types if nt["type"] == clean_type), None)
        label = node_info["label"] if node_info else clean_type.title()
        
        node = {
            "id": node_id,
            "type": clean_type,
            "data": {
                "label": label,
                "config": config
            },
            "position": {"x": x_pos + (i * x_spacing), "y": y_pos}
        }
        nodes.append(node)
        
        # Create edge from previous node
        if i > 0:
            edge = {
                "id": f"edge-{i}",
                "source": f"node-{i}",
                "target": node_id,
                "sourceHandle": "output",
                "targetHandle": "input"
            }
            edges.append(edge)
    
    return {
        "nodes": nodes,
        "edges": edges
    }


def generate_workflow_from_operation(operation_result, user_query):
    """Generate workflow from operation using knowledge graph"""
    
    if not operation_result or not operation_result[0]:
        return None
    
    if not operation_result or not operation_result[0]:
        return None
    
    # operation_result might contain a sequence like "trigger -> swap"
    # Use the same parsing logic as generate_workflow_from_strategy
    return generate_workflow_from_strategy(operation_result, user_query)


def get_default_config(base_type, full_type=""):
    """
    DEPRECATED: Use rag.get_node_config() instead.
    Kept for backwards compatibility.
    """
    return rag.get_node_config(base_type)


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 8080))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"\n🚀 Starting Flask server on port {port}...\n")
    app.run(host='0.0.0.0', port=port, debug=debug)
