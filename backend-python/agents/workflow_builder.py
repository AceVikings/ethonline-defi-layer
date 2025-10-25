"""
DeFi Workflow Builder Agent

This agent uses MeTTa knowledge graphs and ASI:One to help users
create DeFi workflows through natural language conversation.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
from metta.knowledge import get_metta_instance
from metta.defi_rag import DeFiWorkflowRAG
from utils.asi_one_client import ASIOneClient


# Define message models
class WorkflowRequest(Model):
    """User request to generate a workflow"""
    user_query: str
    user_address: str = ""


class WorkflowResponse(Model):
    """Generated workflow response"""
    workflow_json: str
    explanation: str
    strategy_used: str = ""


class QuestionRequest(Model):
    """User question about DeFi or workflows"""
    question: str


class QuestionResponse(Model):
    """Answer to user question"""
    answer: str


# Initialize the agent
workflow_builder = Agent(
    name="defi_workflow_builder",
    seed=os.getenv("UAGENT_SEED", "defi-workflow-builder-seed"),
    port=int(os.getenv("UAGENT_PORT", 8000)),
    endpoint=[f"http://localhost:{os.getenv('UAGENT_PORT', 8000)}/submit"],
    mailbox=os.getenv("UAGENT_MAILBOX_KEY")
)

# Fund agent if needed
fund_agent_if_low(workflow_builder.wallet.address())

# Initialize MeTTa knowledge graph and RAG
print("🧠 Initializing MeTTa Knowledge Graph...")
metta = get_metta_instance()
rag = DeFiWorkflowRAG(metta)

# Initialize ASI:One client
print("🤖 Initializing ASI:One Client...")
asi_client = ASIOneClient()

print(f"""
✅ Workflow Builder Agent initialized!
   
   Agent Address: {workflow_builder.address}
   Agent Name: {workflow_builder.name}
   Port: {os.getenv('UAGENT_PORT', 8000)}
   
   Ready to help users build DeFi workflows! 🚀
""")


@workflow_builder.on_event("startup")
async def startup(ctx: Context):
    """Runs when agent starts up"""
    ctx.logger.info(f"Workflow Builder Agent started with address: {ctx.agent.address}")
    ctx.logger.info("MeTTa Knowledge Graph loaded and ready!")


@workflow_builder.on_message(model=WorkflowRequest)
async def handle_workflow_request(ctx: Context, sender: str, msg: WorkflowRequest):
    """
    Handle requests to generate a new DeFi workflow.
    
    Process:
    1. Classify user intent using ASI:One
    2. Query MeTTa knowledge graph for relevant strategies/operations
    3. Generate workflow JSON structure
    4. Return workflow to user
    """
    
    ctx.logger.info(f"📝 Workflow request from {sender}")
    ctx.logger.info(f"   Query: '{msg.user_query}'")
    
    try:
        # Step 1: Classify intent
        ctx.logger.info("🔍 Classifying user intent...")
        intent, keyword = asi_client.get_intent_and_keyword(msg.user_query)
        ctx.logger.info(f"   Intent: {intent}, Keyword: {keyword}")
        
        # Step 2: Query knowledge graph
        ctx.logger.info("📚 Querying MeTTa knowledge graph...")
        
        workflow_json = None
        strategy_used = ""
        
        if intent == "strategy":
            # Find matching strategy
            strategy_result = rag.find_strategy_for_intent(msg.user_query)
            ctx.logger.info(f"   Strategy: {strategy_result}")
            
            if strategy_result:
                strategy_used = keyword
                # Generate workflow from strategy
                workflow_json = generate_workflow_from_strategy(strategy_result, msg.user_query)
            
        elif intent == "operation":
            # Find matching operation
            operation_result = rag.query_operation(keyword)
            ctx.logger.info(f"   Operation: {operation_result}")
            
            if operation_result:
                workflow_json = generate_workflow_from_operation(operation_result, msg.user_query)
        
        # Step 3: If no match, use ASI:One to generate
        if not workflow_json:
            ctx.logger.info("🤖 Using ASI:One to generate workflow...")
            
            # Provide context from knowledge graph
            context = {
                "strategies": rag.query_all_strategies(),
                "protocols": rag.query_protocols(),
                "node_types": ["trigger", "swap", "aave", "transfer", "condition", "ai"]
            }
            
            workflow_json = asi_client.generate_workflow_from_intent(msg.user_query, context)
        
        # Step 4: Generate explanation
        ctx.logger.info("💬 Generating workflow explanation...")
        explanation = asi_client.explain_workflow(workflow_json)
        
        # Send response
        response = WorkflowResponse(
            workflow_json=json.dumps(workflow_json, indent=2),
            explanation=explanation,
            strategy_used=strategy_used
        )
        
        await ctx.send(sender, response)
        ctx.logger.info("✅ Workflow generated and sent!")
        
    except Exception as e:
        ctx.logger.error(f"❌ Error generating workflow: {e}")
        
        # Send error response
        error_response = WorkflowResponse(
            workflow_json=json.dumps({"error": str(e)}),
            explanation=f"Sorry, I encountered an error: {str(e)}",
            strategy_used=""
        )
        await ctx.send(sender, error_response)


@workflow_builder.on_message(model=QuestionRequest)
async def handle_question(ctx: Context, sender: str, msg: QuestionRequest):
    """
    Handle general questions about DeFi workflows.
    """
    
    ctx.logger.info(f"❓ Question from {sender}: '{msg.question}'")
    
    try:
        # Check if question matches known topics in knowledge graph
        question_lower = msg.question.lower()
        
        answer = None
        
        # Query considerations
        if "gas" in question_lower:
            result = rag.query_consideration("gas_costs")
            if result:
                answer = f"About gas costs: {result[0]}"
        
        elif "slippage" in question_lower:
            result = rag.query_consideration("slippage")
            if result:
                answer = f"About slippage: {result[0]}"
        
        elif "liquidation" in question_lower or "risk" in question_lower:
            result = rag.query_consideration("liquidation_risk")
            if result:
                answer = f"About liquidation risk: {result[0]}"
        
        # Query capabilities
        elif "swap" in question_lower and "how" in question_lower:
            result = rag.query_capability("swap")
            if result:
                answer = f"Swap node: {result[0]}"
        
        elif "aave" in question_lower:
            result = rag.query_capability("aave")
            if result:
                answer = f"Aave node: {result[0]}"
        
        # If no match, use ASI:One
        if not answer:
            ctx.logger.info("🤖 Using ASI:One to answer question...")
            # For now, provide generic answer
            answer = "I can help you build DeFi workflows! Ask me to create a strategy like 'maximize yield' or 'set up dollar cost averaging'."
        
        response = QuestionResponse(answer=answer)
        await ctx.send(sender, response)
        ctx.logger.info("✅ Answer sent!")
        
    except Exception as e:
        ctx.logger.error(f"❌ Error answering question: {e}")
        error_response = QuestionResponse(
            answer=f"Sorry, I encountered an error: {str(e)}"
        )
        await ctx.send(sender, error_response)


def generate_workflow_from_strategy(strategy_result, user_query: str):
    """Generate workflow JSON from MeTTa strategy result"""
    
    # Parse strategy node sequence
    # Example: "trigger -> swap_to_usdc -> aave_supply"
    
    if not strategy_result or not strategy_result[0]:
        return None
    
    node_sequence = str(strategy_result[0])
    node_types = [n.strip() for n in node_sequence.split('->')]
    
    # Generate workflow structure
    nodes = []
    edges = []
    
    x_pos = 100
    y_pos = 100
    x_spacing = 250
    
    for i, node_type in enumerate(node_types):
        node_id = f"node-{i+1}"
        
        # Extract actual node type (remove prefixes like "swap_to_usdc" -> "swap")
        base_type = node_type.split('_')[0]
        
        # Create node
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
        
        # Create edge to previous node
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


def generate_workflow_from_operation(operation_result, user_query: str):
    """Generate workflow JSON from MeTTa operation result"""
    # Similar to strategy but simpler
    return generate_workflow_from_strategy(operation_result, user_query)


def get_default_config(base_type: str, full_type: str):
    """Get default configuration for a node type"""
    
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


if __name__ == "__main__":
    print("🚀 Starting Workflow Builder Agent...")
    workflow_builder.run()
