# 🌊 DeFlow - Visual DeFi Workflow Automation# 🌐 DeFi A2A Liquidity Unifier



> Node-based DeFi workflow builder powered by LIT Protocol (Vincent SDK) with multi-chain support> Cross-chain, AI-driven liquidity aggregation and execution layer built with Hedera, Avail, and Blockscout.



------



## 🚀 Overview## 🚀 Overview



**DeFlow** is a visual workflow automation platform for DeFi operations. Build complex strategies using a drag-and-drop interface, then execute them securely across multiple chains using LIT Protocol's Vincent SDK.**DeFi A2A Liquidity Unifier** is a next-generation decentralized finance protocol that unifies fragmented liquidity across multiple chains using **A2A (Agent-to-Agent)** coordination.



- **Visual Builder:** Node-based workflow canvas built with React Flow- **On-chain:** Hedera smart contracts manage liquidity pools, swaps, and AI agent registration.

- **Multi-Chain:** Execute on Ethereum, Base, Arbitrum, Polygon, Optimism, BNB, Avalanche, Celo- **Off-chain:** AI Agents run simulations, forecasts, and rebalance strategies, communicating via Avail’s cross-chain data layer.

- **Secure Execution:** Powered by LIT Protocol Vincent SDK with PKP (Programmable Key Pairs)- **Blockscout:** Provides analytics, contract visibility, and a query endpoint for our off-chain AI components.

- **Real-Time Monitoring:** Live execution logs and step-by-step debugging

### 🎯 Key Features

### 🎯 Key Features

- Cross-chain liquidity discovery via Avail Nexus SDK

- **6 Node Types:** Trigger, Swap, Aave, Transfer, Condition, and AI nodes- Hedera EVM contracts for pooled swaps and A2A settlement

- **Uniswap V3 Integration:** Multi-hop optimized swaps via Vincent Uniswap Ability- AI Agents performing arbitrage, forecasting, and rebalance strategies

- **Visual Debugging:** Real-time execution logs with per-node status and outputs- Full transparency through Blockscout API integration

- **Authentication:** Vincent OAuth flow with secure PKP wallet management

- **Manual & Automated Triggers:** Execute workflows on-demand or via conditions---



---## 🧩 System Design



## 🧩 System Architecture### **Architecture Overview**



``````

┌──────────────────────────┐                      ┌──────────────────────────┐

│   Frontend (React + TS)  │                      │      User Interface      │

│  ┌────────────────────┐  │                      │  (React + Next.js App)   │

│  │  Workflow Builder  │  │                      │   + Vincent Auth Flow    │

│  │   (React Flow)     │  │                      └───────────┬──────────────┘

│  └─────────┬──────────┘  │                                  │ JWT (User Permissions)

│            │              │                   ┌──────────────┴──────────────┐

│  ┌─────────▼──────────┐  │                   │     Off-Chain Layer (AI)    │

│  │  Vincent Auth      │  │                   │ ─────────────────────────── │

│  │  Context & OAuth   │  │                   │  • Agent Coordinator (A2A)  │

│  └────────────────────┘  │                   │  • Strategy Engine (AI LLM) │

└──────────┬───────────────┘                   │  • Avail Nexus SDK Adapter  │

           │ JWT + API Calls                   └──────────────┬──────────────┘

┌──────────▼────────────────┐                                  │ Execute Strategy Request

│  Backend (Node.js + Express)            ┌─────────────────────┴─────────────────────┐

│  ┌─────────────────────┐ │            │          LIT Protocol (Vincent)           │

│  │  Workflow Engine    │ │            │  • Validate User Policies                 │

│  │  • Node Execution   │ │            │  • PKP Threshold Signing                  │

│  │  • History Tracking │ │            │  • Delegated Transaction Execution        │

│  └─────────┬───────────┘ │            └─────────────────────┬─────────────────────┘

│            │              │                                  │ Signed Transaction

│  ┌─────────▼───────────┐ │                 ┌────────────────┴──────────────┐

│  │ Vincent SDK Config │ │                 │        On-Chain Layer         │

│  │ • LIT Node Client  │ │                 │ ───────────────────────────── │

│  │ • Delegatee Signer │ │                 │ Hedera Smart Contracts        │

│  │ • Ability Clients  │ │                 │   • LiquidityPool.sol         │

│  └─────────┬───────────┘ │                 │   • AgentRegistry.sol         │

└────────────┼─────────────┘                 │   • CrossChainBridge.sol      │

             │                 └────────────────┬──────────────┘

┌────────────▼─────────────┐                                  │ Transaction Data

│   LIT Protocol (Vincent) │                      ┌───────────┴──────────────┐

│  ┌────────────────────┐  │                      │       Blockscout         │

│  │ Uniswap Swap       │  │                      │  Explorer + Analytics    │

│  │ ERC20 Approval     │  │                      └──────────────────────────┘

│  │ Aave Operations    │  │                                  │

│  │ Token Transfers    │  │                      ┌───────────┴──────────────┐

│  └─────────┬──────────┘  │                      │      Avail DA Layer      │

│            │ PKP Signing  │                      │  Cross-Chain Proofs      │

└────────────┼─────────────┘                      └──────────────────────────┘

             │```

┌────────────▼─────────────┐

│   Multi-Chain Execution  │---

│  • Ethereum              │

│  • Base, Arbitrum        │## ⚙️ On-Chain Components

│  • Polygon, Optimism     │

│  • BNB, Avalanche, Celo  │| Contract               | Purpose                                                                 |

└──────────────────────────┘| ---------------------- | ----------------------------------------------------------------------- |

```| `AgentRegistry.sol`    | Registers AI agent addresses, roles, and permissions.                   |

| `LiquidityPool.sol`    | Manages token deposits, swaps, and withdrawals on Hedera.               |

---| `CrossChainBridge.sol` | Interfaces with Avail Nexus SDK to sync liquidity states across chains. |



## 📦 Project Structure---



```## 🧠 Off-Chain Components

ethonline-defi-layer/

├── frontend/                 # React + TypeScript + Vite| Component                    | Description                                                                   |

│   ├── src/| ---------------------------- | ----------------------------------------------------------------------------- |

│   │   ├── pages/| **A2A Coordinator**          | A Python/TypeScript service managing AI-to-AI communication and task routing. |

│   │   │   ├── LandingPage.tsx| **Strategy Engine**          | LLM-based simulation engine generating rebalancing and arbitrage strategies.  |

│   │   │   ├── WorkflowBuilderPage.tsx  # Main workflow builder| **Vincent Ability Wrapper**  | Backend API service that invokes LIT Protocol Vincent abilities with PKP signing. |

│   │   │   └── AuthCallback.tsx| **Avail Adapter**            | Handles proof generation and batch submission to Avail.                       |

│   │   ├── contexts/| **Blockscout API Connector** | Fetches contract and transaction metadata for analytics and visualization.    |

│   │   │   └── AuthContext.tsx          # Vincent auth state

│   │   ├── lib/---

│   │   │   ├── apiClient.ts             # Backend API calls

│   │   │   └── vincentAuth.ts           # Vincent OAuth## 🔮 Vincent Integration (LIT Protocol)

│   │   └── components/

│   │       └── ProtectedRoute.tsx**NeuraFlow** uses [Vincent](https://docs.heyvincent.ai/) - LIT Protocol's programmable key pair (PKP) system - to enable **autonomous AI agent execution** with cryptographic guarantees.

│   └── package.json

│### Key Benefits

├── backend/                  # Node.js + Express + MongoDB- **Trustless Execution**: AI agents sign transactions via decentralized PKPs (no single private key)

│   ├── src/- **Policy Constraints**: User-defined rules enforce what abilities can/cannot do

│   │   ├── config/- **Cross-Chain**: Single PKP controls addresses on multiple EVM chains

│   │   │   ├── chains.js                # Multi-chain configuration- **Audit Trail**: All ability invocations logged on-chain via LIT Protocol

│   │   │   ├── vincent.js               # Vincent SDK helpers

│   │   │   └── database.js### ArbitrageExecutor Ability

│   │   ├── controllers/Our flagship Vincent ability executes cross-chain arbitrage atomically:

│   │   │   ├── workflowController.js    # Execution engine

│   │   │   └── authController.js```typescript

│   │   ├── models/// AI Agent detects opportunity → calls backend API

│   │   │   ├── Workflow.jsPOST /api/abilities/arbitrage

│   │   │   ├── ExecutionHistory.js{

│   │   │   └── User.js  "sourceChain": "hedera",

│   │   └── routes/  "targetChain": "ethereum",

│   │       ├── workflowRoutes.js  "minProfitBps": 50,

│   │       └── authRoutes.js  // ... params

│   └── package.json}

│

└── README.md// Backend invokes Vincent ability via LIT SDK

```// → Ability runs in sandboxed Lit Action VM

// → PKP signs transactions on both chains

---// → Returns execution result

```

## 🎨 Node Types

See [Vincent Integration Plan](./docs/VINCENT_INTEGRATION_PLAN.md) for architecture details.

### 1. **Trigger Node** 

- **Type:** Entry point (no input handles)---

- **Config:** Manual or automated triggers

- **Output:** Workflow execution signal## 🤖 AI Agent Architecture



### 2. **Swap Node** ✅ **IMPLEMENTED**### **Core Components**

- **Type:** DeFi operation

- **Config:** Chain, from token, to token, amount, slippage, decimalsOur AI agent system integrates **Google A2A (Agent-to-Agent)**, **Hedera Agent Kit**, and **Core ML** for on-device price prediction:

- **Integration:** Uniswap V3 via Vincent Swap Ability

- **Features:** Multi-hop optimization, automatic approval handling```

┌─────────────────────────────────────────────────────────┐

### 3. **Aave Node**│              Google A2A Orchestrator                    │

- **Type:** DeFi operation│  (Agent Discovery, Capability Registry, Message Router) │

- **Config:** Action (supply/withdraw/borrow/repay), asset, amount, collateral option└────────────────┬────────────────────────────────────────┘

- **Integration:** Ready for Vincent Aave Ability                 │

- **Status:** Stub implementation      ┌──────────┴──────────┐

      │                     │

### 4. **Transfer Node**┌─────▼─────┐         ┌────▼──────┐

- **Type:** Token operation│ Arbitrage │         │ Risk Mgmt │

- **Config:** Token address, recipient, amount│  Agent    │         │  Agent    │

- **Integration:** Ready for Vincent ERC20 Transfer Ability│ (Python)  │         │ (Python)  │

- **Status:** Stub implementation└─────┬─────┘         └────┬──────┘

      │                    │

### 5. **Condition Node**      │   ┌────────────────┴──────────┐

- **Type:** Logic control      │   │                           │

- **Config:** Left value, operator, right value┌─────▼───▼────┐              ┌──────▼───────┐

- **Output:** Two handles (true/false branches)│ Core ML      │              │ Hedera Agent │

- **Status:** Basic evaluation│ Price Model  │              │ Kit (HAK)    │

│ (.mlmodel)   │              │ Plugin       │

### 6. **AI Node**└──────────────┘              └──────┬───────┘

- **Type:** Agent integration                                     │

- **Config:** System prompt, user prompt template, output format                              ┌──────▼────────┐

- **Integration:** Ready for ASI agent calls                              │ Hedera Smart  │

- **Status:** Stub implementation                              │ Contracts     │

                              └───────────────┘

---```



## 🔮 Vincent Integration (LIT Protocol)### **Agent Types & Roles**



DeFlow uses **Vincent SDK** from LIT Protocol to execute DeFi operations securely via PKPs (Programmable Key Pairs).| Agent Type          | Purpose                                | A2A Capability                    |

| ------------------- | -------------------------------------- | --------------------------------- |

### Key Benefits| **Arbitrage Agent** | Detects cross-chain price discrepancies | `detect_arbitrage_opportunity`    |

- ✅ **Trustless Execution:** Transactions signed via decentralized PKPs| **Risk Agent**      | Monitors pool health, calculates VaR   | `assess_pool_risk`                |

- ✅ **Policy Constraints:** User-defined spending limits and permissions| **Rebalance Agent** | Optimizes LP positions                 | `suggest_rebalance`               |

- ✅ **Multi-Chain:** Single PKP controls addresses across all EVM chains| **Execution Agent** | Bundles and submits transactions       | `execute_strategy`                |

- ✅ **Secure TEE:** All operations run in Trusted Execution Environment

- ✅ **Audit Trail:** Complete execution history with transaction hashes---



### Uniswap Swap Implementation## 🔄 AI Agent Flow (Step-by-Step)



```javascript### **Phase 1: Discovery & Registration**

// 1. Generate signed quote using Uniswap Alpha Router

const signedQuote = await generateSignedUniswapQuote({1. **Agent Startup**

  rpcUrl,   - Each agent boots and registers with Google A2A using capability descriptors

  tokenInAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC   - Registers on-chain via `AgentRegistry.sol` (Hedera)

  tokenInAmount: '10',   - Hedera Agent Kit initializes wallet and contract interfaces

  tokenOutAddress: '0x4200000000000000000000000000000000000006', // WETH

  recipient: pkpEthAddress,```javascript

  slippageTolerance: 100, // 1%// Example: Agent Registration with Hedera Agent Kit

});const { Client, PrivateKey } = require('@hashgraph/sdk');

const { HederaLangchainToolkit, coreQueriesPlugin, coreHTSPlugin } = require('hedera-agent-kit');

// 2. Check and execute ERC20 approval if neededconst { ChatOpenAI } = require('@langchain/openai');

const approvalClient = getERC20ApprovalAbilityClient();

await approvalClient.execute({// Initialize Hedera client (operator account for signing txs)

  rpcUrl,const client = Client.forTestnet().setOperator(

  chainId: 8453,  process.env.HEDERA_ACCOUNT_ID,

  spenderAddress: signedQuote.quote.to,  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)

  tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',);

  tokenAmount: '10000000', // 10 USDC (6 decimals)

}, { delegatorPkpEthAddress: pkpEthAddress });// Initialize Hedera Agent Kit with plugins

const hederaToolkit = new HederaLangchainToolkit({

// 3. Execute swap  client,

const swapClient = getUniswapSwapAbilityClient();  configuration: {

const result = await swapClient.execute({    mode: AgentMode.AUTONOMOUS, // Auto-execute transactions

  rpcUrlForUniswap: rpcUrl,    plugins: [

  signedUniswapQuote      coreQueriesPlugin,  // Account balance, transaction history

}, { delegatorPkpEthAddress: pkpEthAddress });      coreHTSPlugin,      // Token transfers, minting

      crossChainLiquidityPlugin  // Our custom plugin!

console.log('Swap TX:', result.result.swapTxHash);    ]

```  }

});

### Supported Chains

// Get tools for LangChain agent

**Mainnets:**const tools = hederaToolkit.getTools();

- ethereum

- polygon// Initialize LLM (OpenAI, Anthropic, Groq, or local Ollama)

- arbitrumconst llm = new ChatOpenAI({ model: 'gpt-4o-mini' });

- optimism```

- base

- bnb### **Phase 2: Event Monitoring**

- avalanche

- celo2. **Listen for Liquidity Events**

   - Agents subscribe to Avail data blobs containing pool state updates

**Testnets:**   - Blockscout API polls for new `LiquidityAdded` / `Swap` events

- sepolia   - Events are normalized and broadcast via A2A message bus

- basesepolia

- arbitrumsepolia```python

- optimismsepolia# Pseudo-code: Event Listener

- avalanchefujiasync def monitor_liquidity_events():

- polygonmumbai    async for event in blockscout_api.stream_events("LiquidityPool"):

        msg = {

---            "type": "liquidity_update",

            "pool": event.pool_address,

## 🚀 Quick Start            "reserves": event.reserves,

            "timestamp": event.block_time

### Prerequisites        }

        await a2a_client.broadcast("liquidity_updates", msg)

- Node.js v20+ (or v22)```

- MongoDB running locally or remote connection

- Vincent App registered at [Vincent Developer Dashboard](https://app.heyvincent.ai)### **Phase 3: ML-Based Simulation (Core ML)**



### 1. Clone & Install3. **Price Prediction with Core ML**

   - **Model**: LSTM trained on historical DEX data (Uniswap, SushiSwap, Hedera pools)

```bash   - **Input**: 60-minute OHLCV + on-chain volume

git clone <repository-url>   - **Output**: Predicted price movement (next 5 min, 15 min, 1 hr)

cd ethonline-defi-layer

#### **Building the Core ML Model**

# Install backend dependencies

cd backend```bash

npm install# Step 1: Data Collection (Python)

pip install pandas ccxt web3

# Install frontend dependencies

cd ../frontend# Collect historical data from DEXes

npm installpython scripts/collect_dex_data.py --chains hedera,ethereum --days 90

```

# Step 2: Train LSTM Model (TensorFlow/Keras)

### 2. Configure Environment Variablespython scripts/train_price_model.py \

  --input data/dex_ohlcv.csv \

**Backend** (`backend/.env`):  --epochs 100 \

```env  --output models/price_predictor.h5

PORT=3001

NODE_ENV=development# Step 3: Convert to Core ML (.mlmodel)

pip install coremltools

# MongoDBpython scripts/convert_to_coreml.py \

MONGODB_URI=mongodb://localhost:27017/deflow  --keras-model models/price_predictor.h5 \

  --output models/PricePredictor.mlmodel

# Vincent App Configuration (from Vincent Dashboard)```

VINCENT_APP_ID=your_app_id

VINCENT_ALLOWED_AUDIENCE=http://localhost:5176/auth/callback**Training Script Outline** (`train_price_model.py`):

VINCENT_DELEGATEE_PRIVATE_KEY=your_delegatee_private_key```python

import pandas as pd

# LIT Protocolimport tensorflow as tf

LIT_NETWORK=datilfrom tensorflow.keras.models import Sequential

from tensorflow.keras.layers import LSTM, Dense, Dropout

# Optional: Custom RPC URLs for better performance

BASE_RPC_URL=https://mainnet.base.org# Load data

ETHEREUM_RPC_URL=https://eth.llamarpc.comdf = pd.read_csv('data/dex_ohlcv.csv')

# ... (see .env.example for all chains)X, y = prepare_sequences(df, window=60)  # 60-min lookback

```

# Build model

**Frontend** (`frontend/.env`):model = Sequential([

```env    LSTM(128, return_sequences=True, input_shape=(60, 6)),  # OHLCV + volume

VITE_VINCENT_APP_ID=your_app_id    Dropout(0.2),

VITE_VINCENT_REDIRECT_URI=http://localhost:5176/auth/callback    LSTM(64),

VITE_API_URL=http://localhost:3001    Dropout(0.2),

```    Dense(32, activation='relu'),

    Dense(3)  # 3 time horizons

### 3. Run Development Servers])



**Terminal 1 - Backend:**model.compile(optimizer='adam', loss='mse')

```bashmodel.fit(X, y, epochs=100, batch_size=32, validation_split=0.2)

cd backendmodel.save('models/price_predictor.h5')

npm run dev```

```

**Core ML Conversion** (`convert_to_coreml.py`):

**Terminal 2 - Frontend:**```python

```bashimport coremltools as ct

cd frontendfrom tensorflow.keras.models import load_model

npm run dev

```keras_model = load_model('models/price_predictor.h5')

coreml_model = ct.convert(keras_model, source='tensorflow')

### 4. Access the Appcoreml_model.save('models/PricePredictor.mlmodel')

```

Open [http://localhost:5176](http://localhost:5176) in your browser.

4. **Running Inference**

---   - Agents load `.mlmodel` via Core ML runtime (macOS/iOS) or ONNX (Linux servers)

   - Predictions feed into decision logic

## 📖 Usage Guide

```python

### Creating Your First Workflow# Inference Example

import coremltools as ct

1. **Sign In with Vincent**

   - Click "Connect Wallet" on landing pagemodel = ct.models.MLModel('models/PricePredictor.mlmodel')

   - Authorize the Vincent appprediction = model.predict({'input': recent_ohlcv_data})

   - You'll be redirected back with a PKP walletprice_delta_5min = prediction['output'][0]

```

2. **Build Your Workflow**

   - Click "Create Workflow" or navigate to Builder### **Phase 4: Strategy Generation (A2A Coordination)**

   - Drag nodes from the palette onto the canvas

   - Connect nodes by dragging from output to input handles5. **Multi-Agent Consensus with Google A2A**

   - Configure each node using the right sidebar   - **Google A2A** handles agent discovery, capability routing, and consensus

   - **Arbitrage Agent** proposes opportunity

3. **Configure a Swap**   - **Risk Agent** evaluates using VaR calculation

   - Add a Trigger node (entry point)   - **Rebalance Agent** suggests optimal execution path

   - Add a Swap node   - Agents vote on strategy using weighted confidence scores

   - Connect Trigger → Swap

   - Select Swap node and configure:**Google A2A Setup**:

     - **Chain:** base```python

     - **From Token:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC)# Install Google A2A framework

     - **To Token:** `0x4200000000000000000000000000000000000006` (WETH)pip install google-aistudio-a2a

     - **Amount:** `1`

     - **From Token Decimals:** `6`# Each agent registers with A2A orchestrator

     - **Slippage:** `0.5`from google_aistudio.a2a import A2AClient, Capability



4. **Save & Execute**a2a_client = A2AClient(

   - Click "Save Workflow" (top right)    agent_id="arbitrage-001",

   - Click "Execute Manually" button in trigger config    endpoint="https://a2a.googleapis.com/v1"

   - Watch real-time logs in the execution panel)



---# Register capabilities

a2a_client.register_capabilities([

## 🔧 API Reference    Capability(

        name="detect_arbitrage_opportunity",

### Workflow Endpoints        description="Detects profitable cross-chain arbitrage opportunities",

        input_schema={

```typescript            "type": "object",

// Create workflow            "properties": {

POST /api/workflows                "chains": {"type": "array", "items": {"type": "string"}},

Body: { name, description, nodes, edges, triggers }                "threshold": {"type": "number", "minimum": 0.01}

            }

// Get all workflows        },

GET /api/workflows        output_schema={

            "type": "object",

// Get single workflow            "properties": {

GET /api/workflows/:id                "opportunity": {"type": "object"},

                "confidence": {"type": "number"}

// Update workflow            }

PUT /api/workflows/:id        }

Body: { name, description, nodes, edges, triggers, isActive }    )

])

// Delete workflow```

DELETE /api/workflows/:id

**A2A Message Flow**:

// Execute workflow manually```python

POST /api/workflows/:id/execute# Arbitrage agent broadcasts opportunity

arbitrage_proposal = {

// Get execution details    "agent_id": "arbitrage-001",

GET /api/workflows/executions/:executionId    "strategy": "cross_chain_arb",

    "pools": ["hedera/pool-1", "ethereum/uniswap-usdc-hbar"],

// Get workflow execution history    "expected_profit": 234.56,  # USD

GET /api/workflows/:workflowId/executions    "confidence": 0.87,

```    "ml_prediction": {

        "price_delta_5min": +2.3,  # % change predicted by Core ML

### Auth Endpoints        "model_version": "v1.2.0"

    }

```typescript}

// Exchange Vincent code for JWT

POST /api/auth/exchange# Send to risk agent via A2A

Body: { code, redirectUri }risk_response = await a2a_client.call_capability(

    target_agent="risk-001",

// Get current user    capability_name="assess_pool_risk",

GET /api/auth/me    params={

```        "strategy": arbitrage_proposal,

        "time_horizon": "5min"

---    }

)

## 🏗️ Development

# Risk agent performs VaR calculation

### Tech Stackif risk_response["risk_score"] < 0.3 and risk_response["var_95"] < 100:  # Low risk, max $100 loss

    # Query rebalance agent for optimal execution

**Frontend:**    rebalance_response = await a2a_client.call_capability(

- React 18 + TypeScript        target_agent="rebalance-001",

- Vite (build tool)        capability_name="suggest_rebalance",

- React Flow (workflow canvas)        params={"strategy": arbitrage_proposal}

- React Router DOM (routing)    )

- Vincent App SDK (authentication)    

- Tailwind CSS (styling)    # Multi-agent consensus voting

    votes = await a2a_client.gather_votes([

**Backend:**        {"agent": "arbitrage-001", "vote": "approve", "weight": 0.4},

- Node.js + Express        {"agent": "risk-001", "vote": "approve", "weight": 0.4},

- MongoDB + Mongoose        {"agent": "rebalance-001", "vote": "approve", "weight": 0.2}

- Vincent App SDK (auth middleware)    ])

- Vincent Ability SDKs:    

  - `@lit-protocol/vincent-ability-uniswap-swap@8.0.0`    if votes["approval_score"] >= 0.7:  # 70% weighted approval

  - `@lit-protocol/vincent-ability-erc20-approval@3.1.4`        # Execute via Hedera Agent Kit

  - `@lit-protocol/lit-node-client@7.3.1`        await execute_strategy(arbitrage_proposal)

- ethers.js v5.8.0```



### Code Structure**Google A2A Benefits**:

- **Agent Discovery**: New agents automatically discover each other's capabilities

**Workflow Execution Flow:**- **Load Balancing**: A2A routes requests to least-busy agent instances

```- **Versioning**: Agents can specify capability versions (e.g., `assess_pool_risk@v2.0`)

User clicks "Execute" - **Monitoring**: Built-in dashboards for agent performance and message flow

  ↓

Frontend POST /api/workflows/:id/execute---

  ↓

Backend creates ExecutionHistory record (status: running)## 🤝 Google A2A + Hedera Agent Kit Integration

  ↓

Async execution starts:### **How They Work Together**

  1. Find trigger node

  2. Build execution graph from nodes/edgesOur system uses **Google A2A** for agent coordination and **Hedera Agent Kit** for blockchain execution:

  3. Execute nodes recursively:

     - Validate config```

     - Call node-specific function┌─────────────────────────────────────────────────────────┐

     - Record step result│           Google A2A Orchestration Layer                │

     - Find next nodes via edges│  • Agent discovery and capability routing               │

     - Repeat│  • Multi-agent consensus voting                         │

  ↓│  • Message queue and event broadcasting                 │

Update ExecutionHistory (status: completed/failed)└────────────────┬────────────────────────────────────────┘

  ↓                 │

Frontend polls GET /api/workflows/executions/:id      ┌──────────┴──────────┐

  ↓      │                     │

Display real-time logs with status, outputs, errors┌─────▼─────┐         ┌────▼──────┐

```│ Arbitrage │         │ Risk Mgmt │

│  Agent    │         │  Agent    │

**Node Execution (Swap Example):**└─────┬─────┘         └────┬──────┘

```javascript      │                    │

async function executeSwapNode(node, pkpInfo) {      │  Both agents use Hedera Agent Kit

  // 1. Validate configuration      │  for blockchain interactions

  // 2. Get chain RPC URL and ID      │                    │

  // 3. Generate signed Uniswap quote┌─────▼────────────────────▼─────┐

  // 4. Check ERC20 approval│   Hedera Agent Kit Layer       │

  // 5. Execute approval if needed│  • LangChain tool integration  │

  // 6. Execute swap│  • Transaction signing         │

  // 7. Return transaction hashes and results│  • HTS, HCS operations         │

}└────────────┬───────────────────┘

```             │

      ┌──────▼──────┐

---      │   Hedera    │

      │   Network   │

## 🛣️ Roadmap      └─────────────┘

```

### ✅ Completed

- [x] Visual workflow builder with React Flow### **Architecture Pattern**

- [x] Vincent authentication and authorization

- [x] MongoDB workflow persistence1. **Google A2A** = Cognitive layer (decision making, coordination)

- [x] Async execution engine with history2. **Hedera Agent Kit** = Execution layer (blockchain interactions)

- [x] Real-time execution logs in frontend3. **Core ML** = Prediction layer (price forecasting)

- [x] Uniswap V3 swap implementation

- [x] Multi-chain support (8 mainnets, 6 testnets)### **Example: Full Multi-Agent Workflow**

- [x] ERC20 approval handling

```typescript

### 🚧 In Progress// arbitrage-agent.ts

- [ ] Aave supply/withdraw/borrow/repay nodesimport { A2AClient } from 'google-aistudio/a2a';

- [ ] ERC20 transfer node implementationimport { HederaLangchainToolkit, coreHTSPlugin } from 'hedera-agent-kit';

- [ ] Condition node evaluation logicimport { ChatOpenAI } from '@langchain/openai';

- [ ] AI agent integration (ASI)

class ArbitrageAgent {

### 📋 Planned  constructor() {

- [ ] Scheduled/cron-based triggers    // Initialize Google A2A client

- [ ] Event-based triggers (price alerts, on-chain events)    this.a2a = new A2AClient({

- [ ] Workflow templates library      agentId: 'arbitrage-001',

- [ ] Gas optimization strategies      endpoint: process.env.A2A_ENDPOINT

- [ ] Multi-step transaction batching    });

- [ ] Historical performance analytics    

- [ ] Workflow sharing and marketplace    // Initialize Hedera Agent Kit

- [ ] Advanced AI strategies (arbitrage, yield optimization)    const client = Client.forTestnet().setOperator(

      process.env.HEDERA_ACCOUNT_ID,

---      PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)

    );

## 🔐 Security Considerations    

    this.hederaToolkit = new HederaLangchainToolkit({

- **Private Keys:** Never committed to git (use `.env` files)      client,

- **Vincent PKP:** Controlled by LIT Protocol's distributed network      configuration: {

- **Delegatee Signer:** Required for backend to sign requests to LIT        mode: AgentMode.AUTONOMOUS,

- **User Permissions:** Enforced via Vincent policies and spending limits        plugins: [coreHTSPlugin, crossChainLiquidityPlugin]

- **TEE Execution:** All DeFi operations run in Trusted Execution Environment      }

- **CORS:** Currently open for development (restrict in production)    });

    

---    // Initialize LangChain agent

    this.llm = new ChatOpenAI({ model: 'gpt-4o-mini' });

## 📚 Resources  }

  

- [LIT Protocol Documentation](https://developer.litprotocol.com/)  async detectOpportunity() {

- [Vincent SDK Documentation](https://docs.heyvincent.ai/)    // 1. Use Hedera Agent Kit to query liquidity

- [Vincent Developer Dashboard](https://app.heyvincent.ai)    const tools = this.hederaToolkit.getTools();

- [React Flow Documentation](https://reactflow.dev/)    const liquidityTool = tools.find(t => t.name === 'query_cross_chain_liquidity');

- [Uniswap V3 SDK](https://docs.uniswap.org/sdk/v3/overview)    

    const liquidity = await liquidityTool.invoke({

---      chains: ['hedera', 'ethereum'],

      tokenPair: ['HBAR', 'USDC']

## 🤝 Contributing    });

    

Contributions welcome! Please:    // 2. Run Core ML prediction

    const prediction = await this.runMLPrediction(liquidity);

1. Fork the repository    

2. Create a feature branch    // 3. If opportunity detected, broadcast via Google A2A

3. Make your changes    if (prediction.profit > 100 && prediction.confidence > 0.8) {

4. Add tests if applicable      await this.a2a.broadcast({

5. Submit a pull request        channel: 'arbitrage_opportunities',

        message: {

---          type: 'new_opportunity',

          data: {

## 📄 License            pools: liquidity.pools,

            expected_profit: prediction.profit,

MIT            confidence: prediction.confidence

          }

---        }

      });

## 🙏 Acknowledgments      

      // 4. Request risk assessment from Risk Agent

- **LIT Protocol** - For Vincent SDK and PKP infrastructure      const riskAssessment = await this.a2a.call({

- **Uniswap** - For DEX protocol and Alpha Router        targetAgent: 'risk-001',

- **React Flow** - For the amazing workflow canvas library        capability: 'assess_pool_risk',

        params: { opportunity: prediction }

---      });

      

**Built with ❤️ for ETHOnline 2025**      // 5. If approved, execute via Hedera Agent Kit

      if (riskAssessment.approved) {
        return await this.executeSwap(prediction);
      }
    }
  }
  
  async executeSwap(opportunity) {
    // Use Hedera Agent Kit's LangChain agent for natural language execution
    const agent = createToolCallingAgent({
      llm: this.llm,
      tools: this.hederaToolkit.getTools(),
      prompt: ChatPromptTemplate.fromMessages([
        ['system', 'Execute the swap strategy as instructed'],
        ['human', '{input}']
      ])
    });
    
    const executor = new AgentExecutor({ agent, tools: this.hederaToolkit.getTools() });
    
    const result = await executor.invoke({
      input: `Execute swap:
        - Pool: ${opportunity.pools[0].address}
        - Swap ${opportunity.amountIn} HBAR for USDC
        - Min output: ${opportunity.minAmountOut} USDC
        - Max slippage: 2%`
    });
    
    // 6. Report results back to Google A2A
    await this.a2a.publish({
      topic: 'execution_results',
      event: {
        agent: 'arbitrage-001',
        status: 'success',
        profit: result.actualProfit,
        txHash: result.transactionId
      }
    });
    
    return result;
  }
}
```

### **Key Benefits of This Architecture**

| Component         | Responsibility                                  | Why It's Optimal                                          |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------- |
| **Google A2A**    | Agent discovery, consensus, message routing     | Scalable multi-agent coordination without custom protocol |
| **Hedera Kit**    | Blockchain transactions, HTS operations         | Pre-built tools for Hedera, LangChain integration         |
| **LangChain**     | Natural language → function calls               | Agents can use English to execute complex strategies      |
| **Core ML**       | Price prediction, route optimization            | On-device inference, low latency                          |

---

### **Phase 5: Execution via Hedera Agent Kit**

6. **Transaction Bundling**
   - Execution Agent uses **Hedera Agent Kit** in **AUTONOMOUS mode**
   - Tools automatically execute transactions using the operator account
   - LangChain agent orchestrates multi-step operations

```javascript
const { AgentExecutor, createToolCallingAgent } = require('langchain/agents');
const { ChatPromptTemplate } = require('@langchain/core/prompts');

// Create agent with Hedera tools
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a DeFi execution agent. Execute swaps only when arbitrage opportunity is >2% and risk score <0.3'],
  ['placeholder', '{chat_history}'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}']
]);

const agent = createToolCallingAgent({
  llm,
  tools: hederaToolkit.getTools(),
  prompt
});

const agentExecutor = new AgentExecutor({ agent, tools });

// Natural language execution
const result = await agentExecutor.invoke({
  input: `Execute cross-chain swap: 
    - Buy 1000 USDC on Hedera pool 0x123...
    - Sell on Ethereum Uniswap
    - Max slippage: 2%
    - Expected profit: $234.56`
});

console.log(result.output); // "Executed swap. Profit: $241.23. Tx: 0.0.12345@1234567890.123"
```

**Human-in-the-Loop Mode** (for high-value trades):
```javascript
// Switch to RETURN_BYTES mode for user approval
const hederaToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    mode: AgentMode.RETURN_BYTES, // Return transaction bytes instead of executing
    plugins: [coreQueriesPlugin, coreHTSPlugin, crossChainLiquidityPlugin]
  }
});

// Agent generates transaction, user signs via wallet
const txBytes = await agentExecutor.invoke({
  input: "Prepare swap transaction for 10,000 USDC"
});

// Send to frontend for user signature
await walletConnect.signTransaction(txBytes);
```

---

## 🛡️ Failsafes & Risk Controls

### **1. Circuit Breakers**

| Trigger                                | Action                                  |
| -------------------------------------- | --------------------------------------- |
| Pool imbalance > 30%                   | Pause new swaps, alert admin            |
| Agent loses > $500 in 1 hour           | Revoke agent permissions                |
| Gas price spike > 500 gwei             | Delay non-urgent transactions           |
| ML model confidence < 50%              | Skip automated execution, notify human  |

**Implementation**:
```solidity
// In LiquidityPool.sol
uint256 public constant MAX_IMBALANCE = 3000; // 30%
bool public emergencyPaused = false;

modifier whenNotPaused() {
    require(!emergencyPaused, "Circuit breaker active");
    _;
}

function checkAndPause() internal {
    uint256 imbalance = calculateImbalance();
    if (imbalance > MAX_IMBALANCE) {
        emergencyPaused = true;
        emit CircuitBreakerTriggered(block.timestamp, imbalance);
    }
}
```

### **2. User-Controlled Delegation via LIT Protocol (Vincent)**

Instead of agents holding user private keys, we use **LIT Protocol's Vincent** for secure, programmable transaction signing:

#### **How Vincent Works**

1. **User Authentication**: Users connect via Vincent Wallet and grant permissions
2. **Programmable Policies**: Users set spending limits, token allowlists, time windows
3. **Delegated Execution**: Agents execute transactions within user-defined boundaries
4. **Revocable Access**: Users can revoke agent permissions at any time

#### **Vincent Integration**

```typescript
// Install Vincent SDK
npm install @lit-protocol/vincent-app-sdk

// frontend/auth.ts - Authenticate Users
import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient';
import { isExpired } from '@lit-protocol/vincent-app-sdk/jwt';

const vincentClient = getWebAuthClient({
  appId: process.env.VINCENT_APP_ID  // Our registered DeFi A2A App
});

// Check if user already authenticated
if (vincentClient.uriContainsVincentJWT()) {
  const { decodedJWT, jwtStr } = vincentClient.decodeVincentJWTFromUri(
    window.location.origin
  );
  
  // Store JWT for backend requests
  localStorage.setItem('VINCENT_AUTH_JWT', jwtStr);
  
  // Extract user's PKP wallet address
  const userPKP = decodedJWT.pkpWalletAddress;
  console.log(`User authenticated: ${userPKP}`);
} else {
  // Redirect to Vincent Connect Page
  vincentClient.redirectToConnectPage({
    redirectUri: window.location.href,
    abilities: [
      'swap-tokens',      // Our custom Vincent Ability
      'add-liquidity',
      'remove-liquidity'
    ],
    policies: [
      'spending-limit',   // Users configure max spend per transaction
      'token-allowlist',  // Users whitelist which tokens agents can trade
      'time-window'       // Users set active hours for agent execution
    ]
  });
}
```

#### **Backend: Verify JWT and Execute**

```typescript
// backend/agent-executor.ts
import { verify } from '@lit-protocol/vincent-app-sdk/jwt';
import { VincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

async function executeAgentStrategy(userJWT: string, strategy: ArbitrageStrategy) {
  // 1. Verify JWT from user
  try {
    const decodedJWT = verify(userJWT, process.env.REDIRECT_URI);
  } catch (error) {
    throw new Error('Invalid or expired JWT');
  }
  
  // 2. Initialize Vincent Ability Client
  const abilityClient = new VincentAbilityClient({
    appId: process.env.VINCENT_APP_ID,
    delegateePrivateKey: process.env.AGENT_DELEGATEE_PRIVATE_KEY
  });
  
  // 3. Execute swap on user's behalf
  const result = await abilityClient.executeAbility({
    abilityName: 'swap-tokens',
    userJWT: userJWT,
    params: {
      poolAddress: strategy.poolAddress,
      tokenIn: strategy.tokenIn,
      tokenOut: strategy.tokenOut,
      amountIn: strategy.amountIn,
      minAmountOut: strategy.minAmountOut
    }
  });
  
  // 4. Vincent automatically checks user's Policies
  // - Spending limit: Is amountIn < user's max per transaction?
  // - Token allowlist: Is tokenIn/tokenOut in user's approved list?
  // - Time window: Is current time within user's trading hours?
  
  return result;
}
```

#### **Custom Vincent Ability: Swap Tokens**

```typescript
// abilities/swap-tokens/src/index.ts
import { defineAbility } from '@lit-protocol/vincent-ability-sdk';
import { HederaLangchainToolkit } from 'hedera-agent-kit';

export default defineAbility({
  name: 'swap-tokens',
  description: 'Execute token swaps on Hedera liquidity pools',
  
  params: {
    poolAddress: { type: 'string', required: true },
    tokenIn: { type: 'string', required: true },
    tokenOut: { type: 'string', required: true },
    amountIn: { type: 'bigint', required: true },
    minAmountOut: { type: 'bigint', required: true }
  },
  
  async execute({ params, userPKP, policies }) {
    // userPKP = User's Programmable Key Pair wallet address
    
    // Initialize Hedera Agent Kit with user's PKP
    const client = Client.forTestnet().setOperator(
      userPKP,
      await getVincentSessionSigner(userPKP)  // LIT PKP signer
    );
    
    const hederaToolkit = new HederaLangchainToolkit({
      client,
      configuration: {
        mode: AgentMode.AUTONOMOUS,
        plugins: [coreHTSPlugin]
      }
    });
    
    // Execute swap transaction
    const tools = hederaToolkit.getTools();
    const swapTool = tools.find(t => t.name === 'hts_transfer_token');
    
    const result = await swapTool.invoke({
      poolAddress: params.poolAddress,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn.toString(),
      minAmountOut: params.minAmountOut.toString()
    });
    
    return {
      success: true,
      transactionId: result.transactionId,
      amountOut: result.amountOut,
      slippage: result.slippage
    };
  }
});
```

#### **User Experience Flow**

1. **User visits DeFi A2A App**
2. **Redirected to Vincent Connect Page**
3. **User configures policies**:
   - Max spend per swap: $500
   - Allowed tokens: HBAR, USDC, USDT
   - Trading hours: 9am - 5pm EST
4. **User approves and receives JWT**
5. **Agents execute trades within boundaries**
6. **User can revoke access anytime**

### **3. Multi-Signature Validation**

- High-value transactions (>$10k) require 2-of-3 agent consensus **AND** user re-approval via Vincent
- Human override available via admin dashboard

### **4. Slippage Protection**

- All swaps include `minAmountOut` parameter (max 2% slippage)
- Reverts if execution price deviates from prediction

### **5. Monitoring & Rollback**

- All agent actions logged to PostgreSQL + Avail
- Automatic rollback if transaction reverts or gas exceeds budget
- Daily P&L reports per agent with kill-switch for underperformers

### **6. Vincent Policy Examples**

Users configure these policies when authorizing our App:

| Policy Type        | User Configuration                        | Enforcement                                          |
| ------------------ | ----------------------------------------- | ---------------------------------------------------- |
| **Spending Limit** | Max $500 per transaction                  | Vincent blocks swaps > $500                          |
| **Token Allowlist**| Only HBAR, USDC, USDT                     | Vincent blocks trades with unlisted tokens           |
| **Time Window**    | Only execute 9am-5pm EST                  | Vincent rejects after-hours execution requests       |
| **Rate Limiting**  | Max 10 swaps per day                      | Vincent enforces daily quota                         |
| **Budget Cap**     | Total weekly limit: $2000                 | Vincent tracks cumulative spend and blocks when hit  |

---

## 🔐 Security Architecture: LIT Protocol PKPs

### **Why LIT Protocol?**

Traditional AI agents require access to user private keys, creating catastrophic security risks. **LIT Protocol's Programmable Key Pairs (PKPs)** solve this through:

1. **Distributed Key Generation**: Private keys never exist in one place
2. **Threshold Cryptography**: Signatures require consensus from LIT nodes
3. **Programmable Conditions**: Keys only sign when user-defined rules are met
4. **Revocable Delegation**: Users can instantly revoke agent access

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│  1. User authenticates with Vincent Wallet               │
│  2. Configures Policies (spending limits, etc.)          │
│  3. Receives JWT granting App permission                 │
└────────────────┬────────────────────────────────────────┘
                 │ JWT
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Our DeFi A2A Backend                        │
│  4. Verifies JWT signature                               │
│  5. Passes strategy + JWT to Vincent Ability             │
└────────────────┬────────────────────────────────────────┘
                 │ Execute Ability Request
                 ▼
┌─────────────────────────────────────────────────────────┐
│           LIT Protocol Network (Vincent)                 │
│  6. Validates user's Policies (spend limit, tokens, etc.)│
│  7. If approved, LIT nodes threshold-sign transaction    │
│  8. Returns signed transaction bytes                     │
└────────────────┬────────────────────────────────────────┘
                 │ Signed Tx
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Hedera Network                              │
│  9. Transaction executed from user's PKP wallet          │
│ 10. Profit/results recorded on-chain                     │
└─────────────────────────────────────────────────────────┘
```

### **PKP vs Traditional Agent Keys**

| Approach                  | Security Risk                                | User Control                      |
| ------------------------- | -------------------------------------------- | --------------------------------- |
| **Agent holds private key** | 🔴 If agent compromised, funds stolen        | ❌ User must trust agent operator |
| **LIT PKP (our approach)**  | 🟢 Keys distributed, requires LIT consensus  | ✅ User sets rules, revokes anytime |

### **Example: User Journey with PKPs**

```typescript
// User authenticates and delegates to our App
// Behind the scenes, LIT creates a PKP wallet for this user

// User's PKP Wallet: 0x1234...abcd (controlled by LIT network)
// User never sees private key - it doesn't exist in one place!

// User configures Policies:
const userPolicies = {
  spendingLimit: {
    maxPerTransaction: 500,  // USD
    currency: 'USD'
  },
  tokenAllowlist: ['HBAR', 'USDC', 'USDT'],
  timeWindow: {
    start: '09:00',
    end: '17:00',
    timezone: 'America/New_York'
  }
};

// Later, our arbitrage agent proposes a swap:
const strategy = {
  poolAddress: '0x...',
  tokenIn: 'HBAR',
  tokenOut: 'USDC',
  amountIn: 1000,  // HBAR (~$300)
  minAmountOut: 290  // USDC
};

// Vincent checks policies:
// ✅ amountIn ($300) < maxPerTransaction ($500)
// ✅ tokenIn (HBAR) in allowlist
// ✅ tokenOut (USDC) in allowlist
// ✅ current time is 2pm EST (within 9am-5pm window)

// LIT nodes threshold-sign the transaction
// Transaction executes from user's PKP wallet 0x1234...abcd
// User earned $10 profit, all within their defined boundaries!
```

### **Revoking Access**

```typescript
// User can revoke our App's access at any time
// No further transactions can be signed, even if agent tries

// From user's Vincent dashboard:
await vincentWallet.revokeApp({
  appId: 'defi-a2a-liquidity-unifier',
  version: '1.0.0'
});

// All JWTs immediately invalidated
// LIT nodes will refuse to sign future transactions
// User's funds remain safe in PKP wallet
```

---

## 🔌 Hedera Agent Kit Plugin: **Cross-Chain Liquidity Oracle**

### **Plugin Overview**

We're building a **first-party plugin** for Hedera Agent Kit that provides:

- **Real-time cross-chain liquidity depth queries**
- **Avail-based proof verification**
- **AI-optimized routing for multi-hop swaps**

This plugin follows the [official Hedera plugin architecture](https://github.com/hashgraph/hedera-agent-kit/blob/main/docs/PLUGINS.md) and can be registered in the Hedera Agent Kit plugin registry.

### **Why This is Cool**

1. **First Cross-Chain Oracle for HAK**: Enables any HAK agent to query liquidity on Ethereum, Polygon, Base via Avail proofs
2. **Zero-Knowledge Price Feeds**: Avail's data availability ensures tamper-proof historical pricing
3. **Composable AI Strategies**: Other developers can build agents that use our oracle for their own DeFi strategies
4. **LangChain Native**: Automatically works with all LangChain-compatible LLMs (OpenAI, Claude, Groq, Ollama)

### **Plugin Architecture**

```typescript
// hedera-agent-kit-crosschain-oracle/src/index.ts
import { HederaPlugin, BaseTool } from 'hedera-agent-kit';
import { AvailClient } from '@availproject/sdk';
import { z } from 'zod';

export const crossChainLiquidityPlugin: HederaPlugin = {
  name: 'cross-chain-liquidity',
  description: 'Query cross-chain liquidity and suggest optimal swap routes',
  
  tools: [
    {
      name: 'query_cross_chain_liquidity',
      description: 'Fetch liquidity depth across multiple chains with Avail proofs',
      schema: z.object({
        chains: z.array(z.enum(['hedera', 'ethereum', 'base', 'polygon'])),
        tokenPair: z.tuple([z.string(), z.string()]),
      }),
      
      async execute({ chains, tokenPair }, { client, mode }) {
        // Initialize Avail client
        const availClient = new AvailClient(process.env.AVAIL_RPC_URL);
        
        // Fetch latest liquidity state from Avail DA layer
        const blob = await availClient.queryBlob({
          namespace: 'defi-liquidity',
          filter: { chains, tokenPair }
        });
        
        // Generate ZK proof for trustless verification
        const proof = await availClient.generateKZGProof(blob.blobId);
        
        // Query Blockscout for real-time reserves
        const reserves = await Promise.all(
          chains.map(async (chain) => {
            const response = await fetch(
              `https://blockscout-${chain}.io/api/v2/tokens/${tokenPair[0]}/pools`
            );
            const data = await response.json();
            return {
              chain,
              pools: data.items.map(p => ({
                address: p.address,
                reserve0: p.reserve0,
                reserve1: p.reserve1,
                fee: p.fee
              }))
            };
          })
        );
        
        return {
          liquidity: reserves,
          availProof: proof.toHex(),
          timestamp: blob.timestamp,
          dataHash: blob.dataHash
        };
      }
    },
    
    {
      name: 'suggest_optimal_route',
      description: 'Use ML to find the best swap path across chains',
      schema: z.object({
        tokenIn: z.string(),
        tokenOut: z.string(),
        amountIn: z.string(), // BigInt as string
      }),
      
      async execute({ tokenIn, tokenOut, amountIn }, { client, mode }) {
        // Query liquidity across all chains
        const liquidity = await this.tools[0].execute({
          chains: ['hedera', 'ethereum', 'base'],
          tokenPair: [tokenIn, tokenOut]
        }, { client, mode });
        
        // Load ML model for route optimization
        const model = await loadCoreMLModel('models/RouteOptimizer.mlmodel');
        
        // Features: reserves, fees, gas costs, historical slippage
        const features = liquidity.liquidity.flatMap(chain => 
          chain.pools.map(p => [
            parseFloat(p.reserve0),
            parseFloat(p.reserve1),
            p.fee,
            estimateGasCost(chain.chain)
          ])
        );
        
        // Predict best route
        const prediction = model.predict({ features });
        const bestRoute = prediction.routes[0];
        
        return {
          route: bestRoute.path,
          estimatedOutput: bestRoute.amountOut,
          estimatedGas: bestRoute.gasCost,
          priceImpact: bestRoute.priceImpact,
          confidence: bestRoute.confidence
        };
      }
    }
  ]
};
```

### **How Other Developers Use It**

```typescript
import { HederaLangchainToolkit } from 'hedera-agent-kit';
import { crossChainLiquidityPlugin } from '@hedera/agent-kit-crosschain-oracle';

const hederaToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    mode: AgentMode.AUTONOMOUS,
    plugins: [
      coreQueriesPlugin,
      coreHTSPlugin,
      crossChainLiquidityPlugin  // Add our plugin!
    ]
  }
});

// Now agents can use natural language to query cross-chain liquidity
const agent = createToolCallingAgent({ llm, tools: hederaToolkit.getTools(), prompt });
const executor = new AgentExecutor({ agent, tools: hederaToolkit.getTools() });

const result = await executor.invoke({
  input: "What's the best route to swap 1000 HBAR for USDC across all chains?"
});

console.log(result.output);
// "The optimal route is: Hedera Pool 0x123... → Ethereum Uniswap V3.
//  Expected output: 2,341 USDC (0.3% price impact). Gas: ~$2.50"
```

### **Plugin Development Roadmap**

| Phase | Feature                              | Timeline |
| ----- | ------------------------------------ | -------- |
| v0.1  | Basic liquidity queries via Avail    | Week 1   |
| v0.2  | ML-based routing suggestions         | Week 2   |
| v0.3  | ZK proof verification on-chain       | Week 3   |
| v1.0  | Published to HAK plugin registry     | Week 4   |

### **Publishing to Hedera Plugin Registry**

Once complete, we'll register our plugin following the [official process](https://github.com/hashgraph/hedera-agent-kit/blob/main/docs/PLUGINS.md#publish-and-register-your-plugin):

```bash
# 1. Publish to npm
npm publish @hedera/agent-kit-crosschain-oracle

# 2. Submit PR to Hedera Agent Kit registry
# Add to: https://github.com/hashgraph/hedera-agent-kit/blob/main/docs/THIRDPARTYPLUGINS.md
```

---

## 💡 User Flow

1. **User deposits assets** into the Hedera liquidity pool.  
   → `LiquidityPool.sol` mints LP tokens.
2. **AI Agents** monitor Avail data for liquidity events and perform reasoning off-chain.
3. When an opportunity arises (e.g., yield optimization, arbitrage):
   - Agents generate signed execution bundles.
   - Bundles are verified and executed on-chain via `CrossChainBridge.sol`.
4. **Blockscout dashboard** visualizes all contract activity and A2A interactions in real time.
5. Users can view aggregated liquidity, yield, and transaction analytics in the frontend.

---

## 🧰 Tech Stack

| Layer                | Tools / Frameworks                              |
| -------------------- | ----------------------------------------------- |
| **Blockchain**       | Hedera EVM, Avail Nexus SDK                     |
| **Smart Contracts**  | Solidity + Hardhat                              |
| **Off-Chain Agents** | Python (FastAPI), OpenAI / Local LLMs           |
| **Data & Indexing**  | Blockscout MCP, PostgreSQL                      |
| **Frontend**         | React + Tailwind + shadcn/ui                    |
| **Infra (optional)** | AWS Lambda for strategy runs, S3 for batch logs |

---

## 🏆 Tracks & Partners

| Partner        | Usage                                   |
| -------------- | --------------------------------------- |
| **Hedera**     | Smart contracts + main settlement layer |
| **Avail**      | Cross-chain data & proof sharing        |
| **Blockscout** | Contract analytics + MCP data source    |

---

## 🧪 Local Development

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run local Hedera testnet
npx hedera-local start

# Start backend (AI Agents)
python main.py

# Start frontend
npm run dev
```
