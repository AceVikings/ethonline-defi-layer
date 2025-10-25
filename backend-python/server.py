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
        
        # Step 2: Query knowledge graph
        print("📚 Querying knowledge graph...")
        
        workflow_json = None
        strategy_used = ""
        
        if intent == "strategy":
            strategy_result = rag.find_strategy_for_intent(user_query)
            print(f"   Strategy result: {strategy_result}")
            
            if strategy_result:
                strategy_used = keyword
                workflow_json = generate_workflow_from_strategy(strategy_result, user_query)
        
        elif intent == "operation":
            operation_result = rag.query_operation(keyword)
            print(f"   Operation result: {operation_result}")
            
            if operation_result:
                workflow_json = generate_workflow_from_operation(operation_result, user_query)
        
        # Step 3: Use ASI:One if needed
        if not workflow_json:
            print("🤖 Generating with ASI:One...")
            context = {
                "strategies": rag.query_all_strategies(),
                "protocols": rag.query_protocols(),
                "node_types": ["trigger", "swap", "aave", "transfer", "condition", "ai"]
            }
            workflow_json = asi_client.generate_workflow_from_intent(user_query, context)
        
        # Step 4: Generate explanation
        print("💬 Generating explanation...")
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
    """Generate workflow JSON from strategy"""
    
    if not strategy_result or not strategy_result[0]:
        return None
    
    node_sequence = str(strategy_result[0])
    node_types = [n.strip() for n in node_sequence.split('->')]
    
    nodes = []
    edges = []
    
    x_pos = 100
    y_pos = 100
    x_spacing = 250
    
    for i, node_type in enumerate(node_types):
        node_id = f"node-{i+1}"
        base_type = node_type.split('_')[0]
        
        node = {
            "id": node_id,
            "type": base_type,
            "data": {
                "label": base_type.title(),
                "config": get_default_config(base_type, node_type)
            },
            "position": {"x": x_pos + (i * x_spacing), "y": y_pos}
        }
        nodes.append(node)
        
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
    """Generate workflow from operation"""
    return generate_workflow_from_strategy(operation_result, user_query)


def get_default_config(base_type, full_type):
    """Get default config for node type"""
    
    configs = {
        "trigger": {"triggerType": "manual"},
        "swap": {
            "protocol": "uniswap",
            "tokenIn": "USDC" if "usdc" in full_type else "ETH",
            "tokenOut": "ETH" if "usdc" in full_type else "USDC",
            "amount": "",
            "slippage": "0.5"
        },
        "aave": {
            "action": "supply" if "supply" in full_type else "borrow",
            "asset": "USDC",
            "amount": "",
            "chain": "base"
        },
        "transfer": {
            "token": "USDC",
            "recipient": "",
            "amount": ""
        },
        "condition": {
            "leftValue": "",
            "operator": ">",
            "rightValue": ""
        },
        "ai": {
            "systemPrompt": "You are a DeFi assistant.",
            "userPrompt": "",
            "outputFormat": "text"
        }
    }
    
    return configs.get(base_type, {})


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 8080))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"\n🚀 Starting Flask server on port {port}...\n")
    app.run(host='0.0.0.0', port=port, debug=debug)
