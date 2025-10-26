# DeFi Workflow Python Backend

This backend provides AI-powered workflow generation using:
- **uAgents**: Fetch.ai autonomous agent framework
- **MeTTa (Hyperon)**: SingularityNET knowledge graph language
- **ASI:One**: AI-powered natural language processing
- **Flask**: REST API server for Node.js integration

## Architecture

```
backend-python/
├── agents/
│   └── workflow_builder_mailbox.py    # Main uAgent for workflow generation (Mailbox Mode)
├── metta/
│   ├── knowledge.py            # MeTTa knowledge graph initialization
│   └── defi_rag.py             # RAG system for knowledge queries
├── utils/
│   ├── asi_one_client.py       # ASI:One API integration
│   └── mcp_client.py           # MCP (Model Context Protocol) client
├── server.py                   # Flask REST API server
├── requirements.txt            # Python dependencies
└── .env                        # Environment configuration
```

## Setup

### 1. Install Dependencies

```bash
cd backend-python
pip install -r requirements.txt
```

### 2. Configure Environment

The `.env` file is already configured with:
- ASI:One API key
- Agentverse API token
- uAgent configuration
- Flask server settings

### 3. Start the Flask Server

```bash
python server.py
```

The server will start on `http://localhost:5000`

### 4. Run the Workflow Builder Agent (Mailbox Mode)

**Option 1: Direct Run**
```bash
python agents/workflow_builder_mailbox.py
```

**Option 2: Background Run**
```bash
nohup python agents/workflow_builder_mailbox.py > agent.log 2>&1 &
```

The agent will:
1. Initialize the MeTTa knowledge graph
2. Connect to Agentverse via Mailbox
3. Display an Inspector URL - click it to connect via Mailbox on Agentverse
4. Be accessible through ASI:One for natural language workflow generation

## API Endpoints

### POST /api/workflow/generate

Generate a workflow from natural language.

**Request:**
```json
{
  "query": "I want to maximize my USDC yield",
  "userAddress": "0x..." 
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "nodes": [...],
    "edges": [...]
  },
  "explanation": "This workflow converts your assets to USDC and supplies them to Aave for yield...",
  "strategy": "maximize_yield_usdc",
  "intent": "strategy",
  "keyword": "maximize_yield"
}
```

### POST /api/knowledge/query

Query the MeTTa knowledge graph.

**Request:**
```json
{
  "type": "capability",
  "query": "swap"
}
```

**Response:**
```json
{
  "success": true,
  "result": ["Exchange tokens using DEX protocols like Uniswap or 1inch"]
}
```

### POST /api/agents/search

Search for agents on Agentverse (for uAgents node).

**Request:**
```json
{
  "query": "price oracle",
  "semantic": true
}
```

### GET /health

Health check endpoint.

## Integration with Node.js Backend

The Node.js backend (`backend/`) calls this Python server for AI-powered features:

```javascript
// In Node.js backend
const response = await fetch('http://localhost:5000/api/workflow/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userQuery,
    userAddress: req.user.ethAddress
  })
});

const { workflow, explanation } = await response.json();
```

## MeTTa Knowledge Graph

The knowledge graph contains:
- **6 node types**: trigger, swap, aave, transfer, condition, ai
- **DeFi strategies**: yield farming, DCA, leverage, rebalancing
- **Protocols**: Uniswap, 1inch, Aave V3
- **Best practices**: gas optimization, slippage management, risk considerations
- **14 supported chains**: Ethereum, Base, Arbitrum, Optimism, etc.

### Example Queries

```python
from metta.knowledge import get_metta_instance
from metta.defi_rag import DeFiWorkflowRAG

metta = get_metta_instance()
rag = DeFiWorkflowRAG(metta)

# Get swap capabilities
rag.query_capability('swap')

# Get yield maximization strategy
rag.query_strategy('maximize_yield_usdc')

# Find solution for a problem
rag.query_solution('maximize_yield')
```

## ASI Alliance Integration

This backend is designed for the **ASI Alliance hackathon track**:

✅ **uAgents framework**: Autonomous workflow building agent  
✅ **MeTTa reasoning**: Knowledge graph for intelligent strategy selection  
✅ **Agentverse ready**: Can be deployed and registered for discovery  
✅ **ASI:One compatible**: Natural language interaction via Chat Protocol  

## Next Steps

1. **Register agent on Agentverse**: Deploy the workflow_builder agent
2. **Add Chat Protocol**: Enable ASI:One accessibility
3. **Create uAgents node**: Frontend component for agent interaction
4. **Deploy to production**: Host on cloud with proper secrets management
