"""
DeFi Workflow Builder Agent - Mailbox Mode

This agent connects to Agentverse via Mailbox and uses MeTTa knowledge graphs
to generate DeFi workflows from natural language queries.

Usage:
1. Run this script
2. Click the Inspector URL in the output
3. Click "Connect" and select "Mailbox"
4. Your agent will be available on Agentverse and accessible via ASI:One!
"""

import os
import sys
from pathlib import Path
from uagents import Agent, Context, Model
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from metta.knowledge import get_metta_instance
from metta.defi_rag import DeFiWorkflowRAG
from utils.asi_one_client import ASIOneClient

load_dotenv()

# Define message models
class WorkflowQuery(Model):
    """Query to generate a workflow"""
    query: str

class WorkflowResult(Model):
    """Generated workflow result"""
    success: bool
    workflow: dict = {}
    error: str = ""
    reasoning: str = ""

# Initialize MeTTa and ASI:One
print("🧠 Initializing MeTTa Knowledge Graph...")
metta = get_metta_instance()
rag = DeFiWorkflowRAG(metta)

print("🤖 Initializing ASI:One Client...")
asi_client = ASIOneClient()

# Create mailbox agent
SEED = os.getenv("UAGENT_SEED", "defi-workflow-builder-v1")
PORT = int(os.getenv("UAGENT_PORT", "8000"))

agent = Agent(
    name="defi_workflow_builder",
    seed=SEED,
    port=PORT,
    mailbox=True,  # Enable mailbox mode
)

print(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║       🚀 DeFi Workflow Builder Agent (Mailbox Mode)         ║
║                                                              ║
║  Agent Address: {agent.address}
║                                                              ║
║  To connect to Agentverse:                                   ║
║  1. Run this agent                                           ║
║  2. Click the Inspector URL in the console                   ║
║  3. Click "Connect" → "Mailbox"                              ║
║  4. Agent will be available on Agentverse!                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")

@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"✅ Agent started: {ctx.agent.address}")
    ctx.logger.info("📬 Mailbox mode enabled - connecting to Agentverse...")
    ctx.logger.info("🧠 MeTTa Knowledge Graph ready")

@agent.on_message(model=WorkflowQuery)
async def handle_query(ctx: Context, sender: str, msg: WorkflowQuery):
    """Handle workflow generation queries"""
    ctx.logger.info(f"📨 Query from {sender}: {msg.query}")
    
    try:
        # Classify intent using ASI:One
        intent_data = await asi_client.classify_intent(msg.query)
        intent = intent_data.get("intent", "create_workflow")
        keywords = intent_data.get("keywords", [])
        
        ctx.logger.info(f"Intent: {intent}, Keywords: {keywords}")
        
        # Generate workflow
        workflow = {
            "nodes": [
                {
                    "id": "node-1",
                    "type": "trigger",
                    "data": {"label": "Trigger", "config": {"triggerType": "manual"}},
                    "position": {"x": 100, "y": 100}
                }
            ],
            "edges": []
        }
        
        node_id = 2
        prev_id = "node-1"
        
        # Add swap node if query mentions swap/exchange
        if any(k.lower() in ["swap", "exchange", "trade"] for k in keywords):
            workflow["nodes"].append({
                "id": f"node-{node_id}",
                "type": "swap",
                "data": {
                    "label": "Token Swap",
                    "config": {"protocol": "uniswap", "tokenIn": "ETH", "tokenOut": "USDC"}
                },
                "position": {"x": 300, "y": 100}
            })
            workflow["edges"].append({
                "id": f"edge-{prev_id}-{node_id}",
                "source": prev_id,
                "target": f"node-{node_id}"
            })
            prev_id = f"node-{node_id}"
            node_id += 1
        
        # Add aave node if query mentions lending/supply
        if any(k.lower() in ["aave", "supply", "lend", "yield"] for k in keywords):
            workflow["nodes"].append({
                "id": f"node-{node_id}",
                "type": "aave",
                "data": {
                    "label": "Aave Supply",
                    "config": {"action": "supply", "asset": "USDC", "chain": "basesepolia"}
                },
                "position": {"x": 500, "y": 100}
            })
            workflow["edges"].append({
                "id": f"edge-{prev_id}-{node_id}",
                "source": prev_id,
                "target": f"node-{node_id}"
            })
        
        # Send response
        response = WorkflowResult(
            success=True,
            workflow=workflow,
            reasoning=f"Generated based on intent: {intent}"
        )
        
        await ctx.send(sender, response)
        ctx.logger.info(f"✅ Workflow sent to {sender}")
        
    except Exception as e:
        ctx.logger.error(f"❌ Error: {str(e)}")
        error_response = WorkflowResult(
            success=False,
            error=str(e)
        )
        await ctx.send(sender, error_response)

if __name__ == "__main__":
    agent.run()
