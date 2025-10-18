# 🌐 DeFi A2A Liquidity Unifier

> Cross-chain, AI-driven liquidity aggregation and execution layer built with Hedera, Avail, and Blockscout.

---

## 🚀 Overview

**DeFi A2A Liquidity Unifier** is a next-generation decentralized finance protocol that unifies fragmented liquidity across multiple chains using **A2A (Agent-to-Agent)** coordination.

- **On-chain:** Hedera smart contracts manage liquidity pools, swaps, and AI agent registration.
- **Off-chain:** AI Agents run simulations, forecasts, and rebalance strategies, communicating via Avail’s cross-chain data layer.
- **Blockscout:** Provides analytics, contract visibility, and a query endpoint for our off-chain AI components.

### 🎯 Key Features

- Cross-chain liquidity discovery via Avail Nexus SDK
- Hedera EVM contracts for pooled swaps and A2A settlement
- AI Agents performing arbitrage, forecasting, and rebalance strategies
- Full transparency through Blockscout API integration

---

## 🧩 System Design

### **Architecture Overview**

```
                      ┌──────────────────────────┐
                      │      User Interface      │
                      │  (React + Next.js App)   │
                      │   + Vincent Auth Flow    │
                      └───────────┬──────────────┘
                                  │ JWT (User Permissions)
                   ┌──────────────┴──────────────┐
                   │     Off-Chain Layer (AI)    │
                   │ ─────────────────────────── │
                   │  • Agent Coordinator (A2A)  │
                   │  • Strategy Engine (AI LLM) │
                   │  • Avail Nexus SDK Adapter  │
                   └──────────────┬──────────────┘
                                  │ Execute Strategy Request
            ┌─────────────────────┴─────────────────────┐
            │          LIT Protocol (Vincent)           │
            │  • Validate User Policies                 │
            │  • PKP Threshold Signing                  │
            │  • Delegated Transaction Execution        │
            └─────────────────────┬─────────────────────┘
                                  │ Signed Transaction
                 ┌────────────────┴──────────────┐
                 │        On-Chain Layer         │
                 │ ───────────────────────────── │
                 │ Hedera Smart Contracts        │
                 │   • LiquidityPool.sol         │
                 │   • AgentRegistry.sol         │
                 │   • CrossChainBridge.sol      │
                 └────────────────┬──────────────┘
                                  │ Transaction Data
                      ┌───────────┴──────────────┐
                      │       Blockscout         │
                      │  Explorer + Analytics    │
                      └──────────────────────────┘
                                  │
                      ┌───────────┴──────────────┐
                      │      Avail DA Layer      │
                      │  Cross-Chain Proofs      │
                      └──────────────────────────┘
```

---

## ⚙️ On-Chain Components

| Contract               | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `AgentRegistry.sol`    | Registers AI agent addresses, roles, and permissions.                   |
| `LiquidityPool.sol`    | Manages token deposits, swaps, and withdrawals on Hedera.               |
| `CrossChainBridge.sol` | Interfaces with Avail Nexus SDK to sync liquidity states across chains. |

---

## 🧠 Off-Chain Components

| Component                    | Description                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------- |
| **A2A Coordinator**          | A Python/TypeScript service managing AI-to-AI communication and task routing. |
| **Strategy Engine**          | LLM-based simulation engine generating rebalancing and arbitrage strategies.  |
| **Vincent Ability Wrapper**  | Backend API service that invokes LIT Protocol Vincent abilities with PKP signing. |
| **Avail Adapter**            | Handles proof generation and batch submission to Avail.                       |
| **Blockscout API Connector** | Fetches contract and transaction metadata for analytics and visualization.    |

---

## 🔮 Vincent Integration (LIT Protocol)

**NeuraFlow** uses [Vincent](https://docs.heyvincent.ai/) - LIT Protocol's programmable key pair (PKP) system - to enable **autonomous AI agent execution** with cryptographic guarantees.

### Key Benefits
- **Trustless Execution**: AI agents sign transactions via decentralized PKPs (no single private key)
- **Policy Constraints**: User-defined rules enforce what abilities can/cannot do
- **Cross-Chain**: Single PKP controls addresses on multiple EVM chains
- **Audit Trail**: All ability invocations logged on-chain via LIT Protocol

### ArbitrageExecutor Ability
Our flagship Vincent ability executes cross-chain arbitrage atomically:

```typescript
// AI Agent detects opportunity → calls backend API
POST /api/abilities/arbitrage
{
  "sourceChain": "hedera",
  "targetChain": "ethereum",
  "minProfitBps": 50,
  // ... params
}

// Backend invokes Vincent ability via LIT SDK
// → Ability runs in sandboxed Lit Action VM
// → PKP signs transactions on both chains
// → Returns execution result
```

See [Vincent Integration Plan](./docs/VINCENT_INTEGRATION_PLAN.md) for architecture details.

---

## 🤖 AI Agent Architecture

### **Core Components**

Our AI agent system integrates **Google A2A (Agent-to-Agent)**, **Hedera Agent Kit**, and **Core ML** for on-device price prediction:

```
┌─────────────────────────────────────────────────────────┐
│              Google A2A Orchestrator                    │
│  (Agent Discovery, Capability Registry, Message Router) │
└────────────────┬────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼─────┐         ┌────▼──────┐
│ Arbitrage │         │ Risk Mgmt │
│  Agent    │         │  Agent    │
│ (Python)  │         │ (Python)  │
└─────┬─────┘         └────┬──────┘
      │                    │
      │   ┌────────────────┴──────────┐
      │   │                           │
┌─────▼───▼────┐              ┌──────▼───────┐
│ Core ML      │              │ Hedera Agent │
│ Price Model  │              │ Kit (HAK)    │
│ (.mlmodel)   │              │ Plugin       │
└──────────────┘              └──────┬───────┘
                                     │
                              ┌──────▼────────┐
                              │ Hedera Smart  │
                              │ Contracts     │
                              └───────────────┘
```

### **Agent Types & Roles**

| Agent Type          | Purpose                                | A2A Capability                    |
| ------------------- | -------------------------------------- | --------------------------------- |
| **Arbitrage Agent** | Detects cross-chain price discrepancies | `detect_arbitrage_opportunity`    |
| **Risk Agent**      | Monitors pool health, calculates VaR   | `assess_pool_risk`                |
| **Rebalance Agent** | Optimizes LP positions                 | `suggest_rebalance`               |
| **Execution Agent** | Bundles and submits transactions       | `execute_strategy`                |

---

## 🔄 AI Agent Flow (Step-by-Step)

### **Phase 1: Discovery & Registration**

1. **Agent Startup**
   - Each agent boots and registers with Google A2A using capability descriptors
   - Registers on-chain via `AgentRegistry.sol` (Hedera)
   - Hedera Agent Kit initializes wallet and contract interfaces

```javascript
// Example: Agent Registration with Hedera Agent Kit
const { Client, PrivateKey } = require('@hashgraph/sdk');
const { HederaLangchainToolkit, coreQueriesPlugin, coreHTSPlugin } = require('hedera-agent-kit');
const { ChatOpenAI } = require('@langchain/openai');

// Initialize Hedera client (operator account for signing txs)
const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
);

// Initialize Hedera Agent Kit with plugins
const hederaToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    mode: AgentMode.AUTONOMOUS, // Auto-execute transactions
    plugins: [
      coreQueriesPlugin,  // Account balance, transaction history
      coreHTSPlugin,      // Token transfers, minting
      crossChainLiquidityPlugin  // Our custom plugin!
    ]
  }
});

// Get tools for LangChain agent
const tools = hederaToolkit.getTools();

// Initialize LLM (OpenAI, Anthropic, Groq, or local Ollama)
const llm = new ChatOpenAI({ model: 'gpt-4o-mini' });
```

### **Phase 2: Event Monitoring**

2. **Listen for Liquidity Events**
   - Agents subscribe to Avail data blobs containing pool state updates
   - Blockscout API polls for new `LiquidityAdded` / `Swap` events
   - Events are normalized and broadcast via A2A message bus

```python
# Pseudo-code: Event Listener
async def monitor_liquidity_events():
    async for event in blockscout_api.stream_events("LiquidityPool"):
        msg = {
            "type": "liquidity_update",
            "pool": event.pool_address,
            "reserves": event.reserves,
            "timestamp": event.block_time
        }
        await a2a_client.broadcast("liquidity_updates", msg)
```

### **Phase 3: ML-Based Simulation (Core ML)**

3. **Price Prediction with Core ML**
   - **Model**: LSTM trained on historical DEX data (Uniswap, SushiSwap, Hedera pools)
   - **Input**: 60-minute OHLCV + on-chain volume
   - **Output**: Predicted price movement (next 5 min, 15 min, 1 hr)

#### **Building the Core ML Model**

```bash
# Step 1: Data Collection (Python)
pip install pandas ccxt web3

# Collect historical data from DEXes
python scripts/collect_dex_data.py --chains hedera,ethereum --days 90

# Step 2: Train LSTM Model (TensorFlow/Keras)
python scripts/train_price_model.py \
  --input data/dex_ohlcv.csv \
  --epochs 100 \
  --output models/price_predictor.h5

# Step 3: Convert to Core ML (.mlmodel)
pip install coremltools
python scripts/convert_to_coreml.py \
  --keras-model models/price_predictor.h5 \
  --output models/PricePredictor.mlmodel
```

**Training Script Outline** (`train_price_model.py`):
```python
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# Load data
df = pd.read_csv('data/dex_ohlcv.csv')
X, y = prepare_sequences(df, window=60)  # 60-min lookback

# Build model
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(60, 6)),  # OHLCV + volume
    Dropout(0.2),
    LSTM(64),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(3)  # 3 time horizons
])

model.compile(optimizer='adam', loss='mse')
model.fit(X, y, epochs=100, batch_size=32, validation_split=0.2)
model.save('models/price_predictor.h5')
```

**Core ML Conversion** (`convert_to_coreml.py`):
```python
import coremltools as ct
from tensorflow.keras.models import load_model

keras_model = load_model('models/price_predictor.h5')
coreml_model = ct.convert(keras_model, source='tensorflow')
coreml_model.save('models/PricePredictor.mlmodel')
```

4. **Running Inference**
   - Agents load `.mlmodel` via Core ML runtime (macOS/iOS) or ONNX (Linux servers)
   - Predictions feed into decision logic

```python
# Inference Example
import coremltools as ct

model = ct.models.MLModel('models/PricePredictor.mlmodel')
prediction = model.predict({'input': recent_ohlcv_data})
price_delta_5min = prediction['output'][0]
```

### **Phase 4: Strategy Generation (A2A Coordination)**

5. **Multi-Agent Consensus with Google A2A**
   - **Google A2A** handles agent discovery, capability routing, and consensus
   - **Arbitrage Agent** proposes opportunity
   - **Risk Agent** evaluates using VaR calculation
   - **Rebalance Agent** suggests optimal execution path
   - Agents vote on strategy using weighted confidence scores

**Google A2A Setup**:
```python
# Install Google A2A framework
pip install google-aistudio-a2a

# Each agent registers with A2A orchestrator
from google_aistudio.a2a import A2AClient, Capability

a2a_client = A2AClient(
    agent_id="arbitrage-001",
    endpoint="https://a2a.googleapis.com/v1"
)

# Register capabilities
a2a_client.register_capabilities([
    Capability(
        name="detect_arbitrage_opportunity",
        description="Detects profitable cross-chain arbitrage opportunities",
        input_schema={
            "type": "object",
            "properties": {
                "chains": {"type": "array", "items": {"type": "string"}},
                "threshold": {"type": "number", "minimum": 0.01}
            }
        },
        output_schema={
            "type": "object",
            "properties": {
                "opportunity": {"type": "object"},
                "confidence": {"type": "number"}
            }
        }
    )
])
```

**A2A Message Flow**:
```python
# Arbitrage agent broadcasts opportunity
arbitrage_proposal = {
    "agent_id": "arbitrage-001",
    "strategy": "cross_chain_arb",
    "pools": ["hedera/pool-1", "ethereum/uniswap-usdc-hbar"],
    "expected_profit": 234.56,  # USD
    "confidence": 0.87,
    "ml_prediction": {
        "price_delta_5min": +2.3,  # % change predicted by Core ML
        "model_version": "v1.2.0"
    }
}

# Send to risk agent via A2A
risk_response = await a2a_client.call_capability(
    target_agent="risk-001",
    capability_name="assess_pool_risk",
    params={
        "strategy": arbitrage_proposal,
        "time_horizon": "5min"
    }
)

# Risk agent performs VaR calculation
if risk_response["risk_score"] < 0.3 and risk_response["var_95"] < 100:  # Low risk, max $100 loss
    # Query rebalance agent for optimal execution
    rebalance_response = await a2a_client.call_capability(
        target_agent="rebalance-001",
        capability_name="suggest_rebalance",
        params={"strategy": arbitrage_proposal}
    )
    
    # Multi-agent consensus voting
    votes = await a2a_client.gather_votes([
        {"agent": "arbitrage-001", "vote": "approve", "weight": 0.4},
        {"agent": "risk-001", "vote": "approve", "weight": 0.4},
        {"agent": "rebalance-001", "vote": "approve", "weight": 0.2}
    ])
    
    if votes["approval_score"] >= 0.7:  # 70% weighted approval
        # Execute via Hedera Agent Kit
        await execute_strategy(arbitrage_proposal)
```

**Google A2A Benefits**:
- **Agent Discovery**: New agents automatically discover each other's capabilities
- **Load Balancing**: A2A routes requests to least-busy agent instances
- **Versioning**: Agents can specify capability versions (e.g., `assess_pool_risk@v2.0`)
- **Monitoring**: Built-in dashboards for agent performance and message flow

---

## 🤝 Google A2A + Hedera Agent Kit Integration

### **How They Work Together**

Our system uses **Google A2A** for agent coordination and **Hedera Agent Kit** for blockchain execution:

```
┌─────────────────────────────────────────────────────────┐
│           Google A2A Orchestration Layer                │
│  • Agent discovery and capability routing               │
│  • Multi-agent consensus voting                         │
│  • Message queue and event broadcasting                 │
└────────────────┬────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼─────┐         ┌────▼──────┐
│ Arbitrage │         │ Risk Mgmt │
│  Agent    │         │  Agent    │
└─────┬─────┘         └────┬──────┘
      │                    │
      │  Both agents use Hedera Agent Kit
      │  for blockchain interactions
      │                    │
┌─────▼────────────────────▼─────┐
│   Hedera Agent Kit Layer       │
│  • LangChain tool integration  │
│  • Transaction signing         │
│  • HTS, HCS operations         │
└────────────┬───────────────────┘
             │
      ┌──────▼──────┐
      │   Hedera    │
      │   Network   │
      └─────────────┘
```

### **Architecture Pattern**

1. **Google A2A** = Cognitive layer (decision making, coordination)
2. **Hedera Agent Kit** = Execution layer (blockchain interactions)
3. **Core ML** = Prediction layer (price forecasting)

### **Example: Full Multi-Agent Workflow**

```typescript
// arbitrage-agent.ts
import { A2AClient } from 'google-aistudio/a2a';
import { HederaLangchainToolkit, coreHTSPlugin } from 'hedera-agent-kit';
import { ChatOpenAI } from '@langchain/openai';

class ArbitrageAgent {
  constructor() {
    // Initialize Google A2A client
    this.a2a = new A2AClient({
      agentId: 'arbitrage-001',
      endpoint: process.env.A2A_ENDPOINT
    });
    
    // Initialize Hedera Agent Kit
    const client = Client.forTestnet().setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
    );
    
    this.hederaToolkit = new HederaLangchainToolkit({
      client,
      configuration: {
        mode: AgentMode.AUTONOMOUS,
        plugins: [coreHTSPlugin, crossChainLiquidityPlugin]
      }
    });
    
    // Initialize LangChain agent
    this.llm = new ChatOpenAI({ model: 'gpt-4o-mini' });
  }
  
  async detectOpportunity() {
    // 1. Use Hedera Agent Kit to query liquidity
    const tools = this.hederaToolkit.getTools();
    const liquidityTool = tools.find(t => t.name === 'query_cross_chain_liquidity');
    
    const liquidity = await liquidityTool.invoke({
      chains: ['hedera', 'ethereum'],
      tokenPair: ['HBAR', 'USDC']
    });
    
    // 2. Run Core ML prediction
    const prediction = await this.runMLPrediction(liquidity);
    
    // 3. If opportunity detected, broadcast via Google A2A
    if (prediction.profit > 100 && prediction.confidence > 0.8) {
      await this.a2a.broadcast({
        channel: 'arbitrage_opportunities',
        message: {
          type: 'new_opportunity',
          data: {
            pools: liquidity.pools,
            expected_profit: prediction.profit,
            confidence: prediction.confidence
          }
        }
      });
      
      // 4. Request risk assessment from Risk Agent
      const riskAssessment = await this.a2a.call({
        targetAgent: 'risk-001',
        capability: 'assess_pool_risk',
        params: { opportunity: prediction }
      });
      
      // 5. If approved, execute via Hedera Agent Kit
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
