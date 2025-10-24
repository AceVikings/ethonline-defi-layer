# Vincent Integration Plan for DeFlow

## Executive Summary

DeFlow's node-based automation system maps excellently to Vincent's ability architecture. **Major discovery**: Most core DeFi operations we planned already have official Vincent abilities, drastically reducing custom development work. This document outlines how to leverage Vincent Protocol (Lit Protocol's PKP-based delegation system) + **Avail Nexus unified liquidity** to build DeFlow's cross-chain automation engine.

### Key Innovation: Avail Nexus for Seamless Cross-Chain Execution

Avail Nexus provides **chain abstraction** for token operations, enabling:
- **Unified Balance**: Query token balances (ETH, USDC, USDT) across all supported chains in one call
- **Smart Transfer**: Automatically sources tokens from multiple chains to destination (if insufficient on target chain)
- **Bridge + Execute**: Bridge tokens AND execute smart contract function in single transaction
- **Intent-based routing**: Solvers compete to fulfill cross-chain operations (faster than traditional bridges)

**Supported Chains**: Ethereum, Optimism, Polygon, Arbitrum, Avalanche, Base, Scroll, BNB Chain, and more
**Supported Tokens**: ETH, USDC, USDT (18 decimals for ETH, 6 for stablecoins)

This gives DeFlow a major competitive advantage: **true cross-chain DeFi automation** without users managing bridges or worrying about having tokens on the right chain.

---

## Vincent Architecture Overview

### Core Components

1. **Vincent Wallets** (PKPs - Programmable Key Pairs)
   - Non-custodial, cross-chain wallets powered by Lit Protocol
   - Secured by MPC-TSS (Multi-Party Computation with Threshold Signature Scheme) and TEEs (Trusted Execution Environments)
   - Users never expose private keys - all signing happens via decentralized network
   - Each user gets a Vincent Wallet (main PKP) and per-app Agent Wallets (delegated PKPs)

2. **Vincent Abilities** (Modular Executable Functions)
   - npm packages containing executable logic
   - Run in Lit Actions (JavaScript runtime inside TEEs)
   - Each ability has:
     - `precheck()`: Validates prerequisites without execution (gas checks, balance checks, allowances)
     - `execute()`: Performs actual on-chain/off-chain operations
     - Zod schema for type-safe parameter validation
     - Optional policy support (spending limits, whitelists, etc.)

3. **Vincent Policies** (Programmable Guardrails)
   - User-configured constraints on ability execution
   - Examples: daily spending limits, contract whitelists, time windows, rate limiting
   - Evaluated before each execution via `evaluate()` function
   - Stored on-chain for verifiable enforcement

4. **Vincent Apps** (Orchestration Layer)
   - Combine multiple abilities + policies
   - Have unique `appId` and immutable `version`
   - Require delegatee addresses (EOAs with private keys) to execute on behalf of users
   - Users delegate to specific app versions - abilities/policies cannot change without re-delegation
   - Created and managed via Vincent Developer Dashboard

5. **Execution Flow**
   ```
   User delegates to DeFlow App (grants permissions)
        ↓
   DeFlow backend (delegatee) receives workflow trigger
        ↓
   For each node in workflow:
        1. Initialize VincentAbilityClient with delegatee signer
        2. Call precheck() to validate conditions
        3. If precheck succeeds, call execute()
        4. Policies evaluate automatically (spending limits, etc.)
        5. Transaction signed by user's PKP via Lit Network
        6. Transaction submitted on-chain
        ↓
   Workflow completes, return results to user
   ```

---

## DeFlow Node-to-Ability Mapping

### ✅ Nodes Using Existing Official Abilities

| DeFlow Node | Vincent Ability | Package | Status |
|------------|----------------|---------|--------|
| **Swap Node** | Uniswap Swap | `@lit-protocol/vincent-ability-uniswap-swap` | ✅ Ready to use |
| **Aave Supply Node** | Aave (supply operation) | `@lit-protocol/vincent-ability-aave` | ✅ Ready to use |
| **Aave Borrow Node** | Aave (borrow operation) | `@lit-protocol/vincent-ability-aave` | ✅ Ready to use |
| **Aave Repay Node** | Aave (repay operation) | `@lit-protocol/vincent-ability-aave` | ✅ Ready to use |
| **Aave Withdraw Node** | Aave (withdraw operation) | `@lit-protocol/vincent-ability-aave` | ✅ Ready to use |
| **Transfer Node** | ERC20 Transfer | `@lit-protocol/vincent-ability-erc20-transfer` | ✅ Ready to use |
| **Approval Node** | ERC20 Approval | `@lit-protocol/vincent-ability-erc20-approval` | ✅ Ready to use (auto-handled by DeFi abilities) |

### 🌐 Cross-Chain Nodes (Avail Nexus Integration)

| DeFlow Node | Implementation Approach | Use Case | Status |
|------------|-------------------------|----------|--------|
| **Unified Balance Node** | Avail Nexus SDK: `sdk.getUnifiedBalances()` | Query user's token balances (ETH/USDC/USDT) across ALL chains | ✅ Use Avail SDK directly |
| **Smart Transfer Node** | Avail Nexus SDK: `sdk.transfer()` | Transfer tokens to recipient - auto-sources from multiple chains if needed | ✅ Use Avail SDK directly |
| **Bridge Node** | Avail Nexus SDK: `sdk.bridge()` | Bridge tokens between chains via intent solvers | ✅ Use Avail SDK directly |
| **Bridge + Execute Node** | Avail Nexus SDK: `sdk.bridgeAndExecute()` | Bridge tokens AND execute contract call (e.g., bridge USDC to Ethereum + supply to Aave) | ✅ Use Avail SDK directly |

**Avail Nexus Strategy**: Direct integration via `@avail-project/nexus-core` SDK. No need for custom Vincent abilities - Avail handles cross-chain operations natively!

**How it works with Vincent**: 
- DeFlow orchestrator calls Avail Nexus SDK directly (not through Vincent abilities)
- User's Vincent Wallet (PKP) signs transactions that Avail SDK generates
- Avail solvers handle cross-chain routing automatically
- Works for ETH, USDC, USDT across 10+ EVM chains

### 🔨 Other Nodes Requiring Custom Development

| DeFlow Node | Implementation Approach | Complexity |
|------------|-------------------------|-----------|
| **AI Node** | Custom ability calling external LLM APIs (OpenAI, Anthropic, etc.) | Medium |
| **If/Else Node** | Orchestrator logic (not an ability - handled in DeFlow backend) | Low |
| **Comparison Node** | Orchestrator logic (evaluate conditions in backend) | Low |
| **Input Node** | Frontend data collection → pass to orchestrator | Low |
| **Price Oracle Node** | Can use Avail Nexus query OR custom Chainlink ability | Low |

### 📝 Custom Ability Example: AI Decision Node

**Purpose**: Allow workflows to make decisions using AI (e.g., "Should I swap now based on market conditions?")

**Implementation**:
```typescript
// Ability: @deflow/vincent-ability-ai-decision
import { createVincentAbility } from '@lit-protocol/vincent-ability-sdk';
import { z } from 'zod';

const aiDecisionAbility = createVincentAbility({
  packageName: '@deflow/vincent-ability-ai-decision' as const,
  abilityDescription: 'Query LLM for decision-making in DeFi workflows' as const,
  
  abilityParamsSchema: z.object({
    prompt: z.string().describe('The decision prompt for the AI'),
    context: z.record(z.any()).describe('Market data, balances, etc.'),
    aiProvider: z.enum(['openai', 'anthropic']).default('openai'),
    model: z.string().default('gpt-4'),
  }),

  precheck: async ({ abilityParams }) => {
    // Validate API keys exist, rate limits not exceeded
    return { success: true };
  },

  execute: async ({ abilityParams, litActionContext }) => {
    const { prompt, context, aiProvider, model } = abilityParams;
    
    // Call external AI API (OpenAI, Anthropic, etc.)
    const response = await fetch(`https://api.${aiProvider}.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a DeFi decision assistant. Respond with JSON.' },
          { role: 'user', content: `${prompt}\n\nContext: ${JSON.stringify(context)}` }
        ],
      }),
    });

    const aiDecision = await response.json();
    
    return {
      success: true,
      decision: aiDecision.choices[0].message.content,
      reasoning: aiDecision.choices[0].message.content,
    };
  },
});
```

**Note**: This ability doesn't sign transactions - it just makes API calls and returns data. The orchestrator uses this data to decide which subsequent nodes to execute.

### 📝 Avail Nexus Integration (No Custom Abilities Needed!)

**Purpose**: Avail Nexus provides chain abstraction for cross-chain token operations. Unlike Vincent abilities, we integrate Avail SDK directly in the DeFlow orchestrator.

**Supported Operations**:

1. **Unified Balance Query**:
```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const nexusSDK = new NexusSDK({ network: 'mainnet' });
await nexusSDK.initialize(provider); // User's wallet provider

// Get all balances across all chains
const balances = await nexusSDK.getUnifiedBalances();
// Returns: UserAsset[] with balance breakdown per chain

// Get specific token balance
const usdcBalance = await nexusSDK.getUnifiedBalance('USDC');
// Returns: { symbol: 'USDC', balance: '150.5', breakdown: [{ chain: { id: 8453 }, balance: '100' }, ...] }
```

2. **Smart Transfer** (auto-sources from multiple chains):
```typescript
// Transfer USDC to recipient on Arbitrum
// SDK automatically:
// 1. Checks if user has USDC + ETH for gas on Arbitrum
// 2. Uses direct transfer if sufficient funds exist
// 3. Falls back to chain abstraction (sources from Base + Optimism) if needed
const result = await nexusSDK.transfer({
  token: 'USDC',
  amount: 100,
  chainId: 42161, // Arbitrum
  recipient: '0x...',
  sourceChains: [8453, 10], // Optional: only use Base + Optimism as sources
});

// Returns: { success: true, transactionHash: '0x...', explorerUrl: 'https://...' }
```

3. **Bridge + Execute** (game-changer for DeFi automation):
```typescript
// Bridge USDC from Base to Ethereum AND supply to Aave - in ONE transaction!
const result = await nexusSDK.bridgeAndExecute({
  token: 'USDC',
  amount: '100000000', // 100 USDC (6 decimals)
  toChainId: 1, // Ethereum
  sourceChains: [8453], // Use USDC from Base
  execute: {
    contractAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Aave V3 Pool
    contractAbi: aaveV3PoolAbi,
    functionName: 'supply',
    buildFunctionParams: (token, amount, chainId, userAddress) => {
      const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
      const amountWei = parseUnits(amount, 6);
      return {
        functionParams: [tokenAddress, amountWei, userAddress, 0], // Aave supply params
      };
    },
    tokenApproval: {
      token: 'USDC',
      amount: '100000000', // SDK handles approval automatically
    },
  },
  waitForReceipt: true,
});

// Returns: { 
//   success: true, 
//   bridgeTransactionHash: '0x...', (Base)
//   executeTransactionHash: '0x...', (Ethereum - Aave supply)
//   executeExplorerUrl: 'https://etherscan.io/tx/0x...'
// }
```

**Integration with DeFlow Orchestrator**:
```typescript
// In DeFlow backend orchestrator
case 'availUnifiedBalance':
  const nexusSDK = new NexusSDK();
  await nexusSDK.initialize(userWalletProvider);
  
  const balances = await nexusSDK.getUnifiedBalances();
  context.results[node.id] = { balances };
  break;

case 'availBridgeAndExecuteAave':
  // User wants to supply to Aave on Ethereum, but has USDC on Base
  const result = await nexusSDK.bridgeAndExecute({
    token: context.results.input.token,
    amount: context.results.input.amount,
    toChainId: 1, // Ethereum
    sourceChains: [8453], // Use funds from Base
    execute: {
      contractAddress: AAVE_V3_POOL_ADDRESS,
      // ... Aave supply configuration
    },
  });
  
  context.results[node.id] = result;
  break;
```

**Key Advantages over Custom Abilities**:
- ✅ **No custom code needed** - Avail SDK handles everything
- ✅ **Automatic optimization** - SDK chooses cheapest route (direct transfer vs chain abstraction)
- ✅ **Intent-based routing** - Solvers compete for best execution
- ✅ **Built-in approval handling** - SDK manages token approvals automatically
- ✅ **Progress tracking** - Real-time events for transaction status

**Limitations**:
- ❌ Only supports ETH, USDC, USDT (no other tokens)
- ❌ Only supports ~10 EVM chains (no Solana, Bitcoin, etc.)
- ❌ Cannot query DeFi protocol state (APYs, liquidity, etc.) - only token balances

**For operations beyond Avail's scope**, use Vincent abilities (Uniswap, Aave) or custom integrations (Chainlink price feeds, AI APIs).

---

## Orchestration Strategy

### Problem: Vincent Apps Don't Natively Support Workflow DAGs

Vincent abilities are designed to be executed independently via:
```typescript
const client = getVincentAbilityClient({ bundledVincentAbility, ethersSigner });
await client.precheck(params, { delegatorPkpEthAddress });
await client.execute(params, { delegatorPkpEthAddress });
```

**There is no built-in workflow orchestration or chaining system.**

### Solution: DeFlow Backend as Orchestrator

DeFlow's backend service acts as the intelligent orchestrator that:

1. **Stores Workflow Definitions** (DAG structure from frontend workflow builder)
   - Nodes (type, parameters, position)
   - Edges (connections, data flow)
   - Triggers (time-based, event-based, manual)

2. **Executes Workflows** (delegatee-driven execution)
   - Walks DAG in topological order
   - For each node:
     - If node is an ability → call `precheck()` then `execute()`
     - If node is conditional logic (If/Else) → evaluate condition in backend
     - If node is AI → call AI ability and use response to route execution
     - Pass outputs from upstream nodes as inputs to downstream nodes
   - Handles branching, loops (with cycle detection), and error recovery

3. **Manages State** (workflow execution context)
   - Track which nodes have executed
   - Store intermediate results (balances, swap amounts, AI decisions)
   - Maintain execution history for debugging/auditing

### Example Workflow Execution #1: Simple Auto-Compound

**Workflow**: "Auto-compound Aave when APY > 5%"

```
Nodes:
1. Input Node (user sets: token, threshold APY)
2. Price Oracle Node (fetch current Aave APY)
3. Comparison Node (APY > threshold?)
4. If/Else Node
   - True branch: Aave Supply Node
   - False branch: No-op
```

**Backend Execution Flow**: (See code in next section)

### Example Workflow Execution #2: Cross-Chain Aave Supply (Avail Nexus)

**Workflow**: "Supply to Aave on Ethereum using USDC from any chain"

```
User scenario: Has 100 USDC split across Base (60) and Optimism (40), wants to supply all to Aave on Ethereum

Nodes:
1. Input Node (token = USDC, amount = 100, targetChain = Ethereum)
2. Avail Unified Balance Node (check where user has USDC)
3. Avail Bridge + Execute Node (bridge from Base + Optimism → Ethereum AND supply to Aave)
```

**Key Innovation**: Single operation handles cross-chain sourcing AND DeFi execution!

**Backend Execution Flow**:
```typescript
// DeFlow orchestrator
const context = {
  delegatorPkpEthAddress: user.vincentWalletAddress,
  results: {},
};

for (const node of workflow.getTopologicalOrder()) {
  switch (node.type) {
    case 'input':
      context.results[node.id] = { 
        token: 'USDC', 
        amount: '100000000', // 100 USDC (6 decimals)
        targetChain: 1 // Ethereum
      };
      break;

    case 'availUnifiedBalance':
      // Initialize Avail Nexus SDK
      const nexusSDK = new NexusSDK({ network: 'mainnet' });
      await nexusSDK.initialize(userWalletProvider); // PKP wallet provider
      
      // Query unified balances
      const usdcBalance = await nexusSDK.getUnifiedBalance('USDC');
      
      context.results[node.id] = {
        totalBalance: usdcBalance.balance, // "100.0"
        breakdown: usdcBalance.value.breakdown,
        // [
        //   { chain: { id: 8453, name: 'Base' }, balance: '60.0' },
        //   { chain: { id: 10, name: 'Optimism' }, balance: '40.0' }
        // ]
      };
      break;

    case 'availBridgeAndExecute':
      // Bridge USDC from Base + Optimism to Ethereum AND supply to Aave - in ONE flow!
      const aaveV3PoolAddress = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
      const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on Ethereum
      
      const result = await nexusSDK.bridgeAndExecute({
        token: 'USDC',
        amount: context.results.input.amount,
        toChainId: context.results.input.targetChain,
        sourceChains: [8453, 10], // Use funds from Base + Optimism
        execute: {
          contractAddress: aaveV3PoolAddress,
          contractAbi: [
            {
              inputs: [
                { internalType: 'address', name: 'asset', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
                { internalType: 'address', name: 'onBehalfOf', type: 'address' },
                { internalType: 'uint16', name: 'referralCode', type: 'uint16' },
              ],
              name: 'supply',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
          functionName: 'supply',
          buildFunctionParams: (token, amount, chainId, userAddress) => {
            const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
            return {
              functionParams: [usdcAddress, amountWei, userAddress, 0],
            };
          },
          tokenApproval: {
            token: 'USDC',
            amount: context.results.input.amount,
          },
        },
        waitForReceipt: true,
        requiredConfirmations: 3,
      });

      context.results[node.id] = {
        success: result.success,
        bridgeHash: result.bridgeTransactionHash, // Bridge tx on source chains
        aaveSupplyHash: result.executeTransactionHash, // Aave supply tx on Ethereum
        explorerUrl: result.executeExplorerUrl,
      };
      
      // What happened behind the scenes:
      // 1. Avail SDK detected user has USDC on Base (60) + Optimism (40)
      // 2. Created intent to bridge 60 from Base and 40 from Optimism to Ethereum
      // 3. Solvers fulfilled the intent (faster than traditional bridges)
      // 4. Once USDC arrived on Ethereum, automatically approved + supplied to Aave
      // 5. All in ONE user-signed operation!
      break;

    case 'priceOracle':
      // Custom ability or direct API call
      const apyData = await fetchAaveAPY(node.parameters.token);
      context.results[node.id] = { apy: apyData };
      break;

    case 'comparison':
      const { leftValue, operator, rightValue } = evaluateExpression(node, context);
      context.results[node.id] = { result: leftValue > rightValue };
      break;

    case 'ifElse':
      const condition = context.results[node.inputs.condition];
      const nextNode = condition.result ? node.trueBranch : node.falseBranch;
      // Continue execution on selected branch
      break;

    case 'aaveSupply':
      const { bundledVincentAbility } = await import('@lit-protocol/vincent-ability-aave');
      const aaveClient = getVincentAbilityClient({
        bundledVincentAbility,
        ethersSigner: delegateeSigner,
      });

      // Precheck
      const precheckResult = await aaveClient.precheck(
        {
          rpcUrl: node.parameters.rpcUrl,
          chainId: node.parameters.chainId,
          aaveAction: 'supply',
          tokenAddress: context.results.input.token,
          amount: context.results.input.amount,
        },
        { delegatorPkpEthAddress: context.delegatorPkpEthAddress }
      );

      if (!precheckResult.success) {
        throw new Error(`Precheck failed: ${precheckResult.runtimeError}`);
      }

      // Execute
      const executeResult = await aaveClient.execute(
        {
          rpcUrl: node.parameters.rpcUrl,
          chainId: node.parameters.chainId,
          aaveAction: 'supply',
          tokenAddress: context.results.input.token,
          amount: context.results.input.amount,
        },
        { delegatorPkpEthAddress: context.delegatorPkpEthAddress }
      );

      context.results[node.id] = executeResult;
      break;

    // ... handle other node types
  }
}

await litNodeClient.disconnect();
```

---

## Data Flow Between Nodes

### Challenge: Passing Outputs to Inputs

DeFlow nodes connect via edges that define data flow:
```
SwapNode.output.amountOut → TransferNode.input.amount
```

Vincent abilities don't know about each other - they're independent packages.

### Solution: DeFlow Variable Resolution

The orchestrator maintains a variable resolution system:

```typescript
interface NodeOutput {
  nodeId: string;
  outputName: string;
  value: any;
}

interface NodeInput {
  source: 'constant' | 'nodeOutput' | 'userInput';
  value?: any;           // For constants
  nodeId?: string;       // For node outputs
  outputName?: string;   // For node outputs
}

// Example: Transfer node gets amount from swap node
const transferParams = {
  rpcUrl: 'https://base.llamarpc.com',
  chainId: 8453,
  tokenAddress: resolveInput(node.inputs.tokenAddress, context),
  recipientAddress: resolveInput(node.inputs.recipientAddress, context),
  amount: resolveInput(node.inputs.amount, context), // Resolves to context.results.swapNode.amountOut
};

function resolveInput(input: NodeInput, context: ExecutionContext): any {
  switch (input.source) {
    case 'constant':
      return input.value;
    
    case 'nodeOutput':
      return context.results[input.nodeId][input.outputName];
    
    case 'userInput':
      return context.results.inputNode[input.value];
  }
}
```

---

## Vincent App Setup for DeFlow

### App Configuration

**App Name**: DeFlow Automation Engine

**App Description**: Cross-chain DeFi automation with visual workflow builder and Avail Nexus unified liquidity

**Delegatee Addresses**: DeFlow backend server EOA (we control the private key)

**Abilities to Include**:

*Core DeFi Operations (Official Vincent Abilities):*
- `@lit-protocol/vincent-ability-uniswap-swap`
- `@lit-protocol/vincent-ability-aave`
- `@lit-protocol/vincent-ability-erc20-transfer`
- `@lit-protocol/vincent-ability-erc20-approval`

*AI & Automation (Custom Vincent Abilities):*
- `@deflow/vincent-ability-ai-decision` (LLM-powered decision making)
- `@deflow/vincent-ability-price-oracle` (Chainlink price feeds - optional)

*Cross-Chain (External SDK - NOT Vincent Abilities):*
- `@avail-project/nexus-core` (Avail Nexus SDK for cross-chain operations)
  - Integrated directly in orchestrator, NOT as Vincent ability
  - Handles: unified balances, smart transfers, bridge + execute

**Note on Avail Nexus**: We don't create Vincent abilities for Avail - we use their SDK directly in the DeFlow backend. User's PKP wallet signs Avail transactions just like any other transaction.
- `@lit-protocol/vincent-ability-debridge`
- `@deflow/vincent-ability-ai-decision` (custom)
- `@deflow/vincent-ability-price-oracle` (custom)

**Policies to Enable**:
- Daily Spending Limit (prevent runaway automation)
- Contract Whitelist (restrict to known safe contracts)

### User Onboarding Flow

1. User visits DeFlow landing page → clicks "Connect Wallet"
2. DeFlow redirects to Vincent Connect Page (hosted by Vincent)
3. User authenticates via:
   - Email/phone (Vincent creates PKP for them)
   - Passkey (biometric auth)
   - Existing wallet (MetaMask, etc.)
4. User reviews abilities DeFlow requests and configures policies
5. User approves delegation → Agent Wallet (PKP) created for DeFlow
6. Vincent redirects back to DeFlow with JWT token
7. DeFlow backend verifies JWT, stores user's `delegatorPkpEthAddress`
8. User can now build workflows that execute via their Vincent Wallet

### Backend Authentication

```typescript
// DeFlow backend (Express.js)
import { getAuthenticateUserExpressHandler } from '@lit-protocol/vincent-app-sdk/expressMiddleware';

const authenticateUser = getAuthenticateUserExpressHandler(process.env.ALLOWED_AUDIENCE);

app.post('/workflow/execute', authenticateUser, async (req, res) => {
  const { pkpAddress } = req.user; // Vincent Wallet address
  const { workflowId } = req.body;

  // Execute workflow on behalf of user
  const result = await orchestrator.executeWorkflow(workflowId, pkpAddress);
  res.json(result);
});
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create Vincent App on Developer Dashboard
- [ ] Set up delegatee EOA and secure private key (use HSM or AWS KMS in production)
- [ ] Implement user authentication flow (Vincent Connect Page integration)
- [ ] Build basic orchestrator that can execute single ability (e.g., Uniswap swap)
- [ ] Test end-to-end: user delegates → DeFlow executes swap → transaction confirmed

### Phase 2: Core DeFi Nodes (Week 3-4)
- [ ] Integrate all official abilities (Aave, Transfer, deBridge)
- [ ] Build frontend node palette with DeFi nodes
- [ ] Implement data flow resolution (node outputs → node inputs)
- [ ] Add precheck validation before execution (show gas estimates, balance checks)
- [ ] Test multi-node workflows (e.g., swap → Aave supply)

### Phase 3: Conditional Logic (Week 5)
- [ ] Implement If/Else node evaluation in orchestrator
- [ ] Add Comparison node (>, <, ==, &&, ||)
- [ ] Build visual condition builder in frontend
- [ ] Test branching workflows (e.g., "only supply if APY > 5%")

### Phase 4: AI Integration (Week 6)
- [ ] Build custom AI Decision ability
- [ ] Integrate with OpenAI/Anthropic APIs
- [ ] Add AI node to frontend palette
- [ ] Implement prompt engineering for DeFi context
- [ ] Test AI-driven workflows (e.g., "AI decides when to rebalance portfolio")

### Phase 5: Advanced Features (Week 7-8)
- [ ] Add time-based triggers (cron jobs)
- [ ] Implement event-based triggers (price alerts, on-chain events via subgraphs)
- [ ] Build workflow execution history/logs
- [ ] Add error handling and retry logic
- [ ] Implement workflow simulation (dry-run mode)

### Phase 6: ASI Alliance Integration (Week 9-10)
- [ ] Integrate ASI Alliance agents for advanced strategy generation
- [ ] Build "AI Strategy Generator" that creates workflows from natural language
- [ ] Add portfolio optimization recommendations
- [ ] Implement multi-agent coordination (e.g., risk agent + execution agent)

### Phase 7: Cross-Chain via Avail Nexus (Week 11-12)
- [ ] Integrate Avail Nexus for unified liquidity across chains
- [ ] Build cross-chain swap node (Base → Arbitrum → Optimism)
- [ ] Add cross-chain condition evaluation (check balances on multiple chains)
- [ ] Test complex multi-chain workflows

---

## Security Considerations

### 1. Delegatee Key Management
- **Development**: Use separate test delegatee with small gas funds
- **Production**: Store delegatee private key in AWS KMS or HashiCorp Vault
- **Rotation**: Implement quarterly key rotation schedule
- **Monitoring**: Set up alerts for delegatee transactions (Tenderly, Defender)

### 2. Policy Enforcement
- **Always enable Spending Limit policy** (prevent runaway costs)
- **Use Contract Whitelist policy** (restrict to Aave, Uniswap, etc.)
- **Validate all user inputs** (prevent injection attacks in AI prompts)

### 3. Workflow Validation
- **Cycle detection**: Prevent infinite loops in workflow DAGs
- **Gas estimation**: Show users estimated gas costs before execution
- **Simulation mode**: Dry-run workflows on forked networks (Tenderly)

### 4. User Trust
- **Immutable versions**: Users delegate to specific app version - we can't change abilities without re-delegation
- **On-chain verification**: All delegations recorded on-chain (transparent)
- **Revocation**: Users can revoke permissions anytime

---

## Avail Nexus Integration Architecture

### How Avail Nexus Fits with Vincent

**Separation of Concerns**:
- **Vincent Abilities**: DeFi protocol interactions (Uniswap swap, Aave supply, etc.)
- **Avail Nexus SDK**: Cross-chain token operations (balances, transfers, bridge + execute)

**Integration Flow**:
```
User delegates to DeFlow App (Vincent PKP created)
    ↓
DeFlow orchestrator receives workflow trigger
    ↓
For cross-chain nodes:
    1. Initialize Avail Nexus SDK with user's wallet provider
    2. Call Avail SDK methods (transfer, bridgeAndExecute, etc.)
    3. User's PKP signs the transaction Avail generates
    4. Avail solvers execute cross-chain routing
    5. Return results to orchestrator
    ↓
For DeFi nodes:
    1. Initialize Vincent Ability Client
    2. Call precheck() then execute()
    3. Lit Actions execute ability via PKP
    ↓
Workflow completes
```

### Avail Nexus Supported Chains & Tokens

**Chains** (Mainnet):
- Ethereum (1)
- Optimism (10)
- Polygon (137)
- Arbitrum (42161)
- Avalanche (43114)
- Base (8453)
- Scroll (534351)
- BNB Chain (56)
- Sophon (50104)
- Kaia (8217)
- HyperEVM (9000000)

**Tokens**:
- ETH (18 decimals) - Available on all EVM chains
- USDC (6 decimals) - Available on all supported chains
- USDT (6 decimals) - Available on all supported chains

### Avail Nexus Key Features for DeFlow

1. **Unified Balance View**:
```typescript
const balances = await nexusSDK.getUnifiedBalances();
// Returns ALL tokens across ALL chains in one call
// Use case: "Show user total portfolio value"
```

2. **Smart Transfer** (Automatic Optimization):
```typescript
const result = await nexusSDK.transfer({
  token: 'USDC',
  amount: 100,
  chainId: 42161, // Arbitrum
  recipient: '0x...',
});
// SDK automatically:
// - Checks if user has USDC + gas on Arbitrum
// - If YES: Direct transfer (fast, cheap)
// - If NO: Sources from other chains via chain abstraction
```

3. **Bridge + Execute** (The Game-Changer):
```typescript
const result = await nexusSDK.bridgeAndExecute({
  token: 'USDC',
  amount: '100000000',
  toChainId: 1, // Ethereum
  sourceChains: [8453], // Use USDC from Base
  execute: {
    contractAddress: aavePoolAddress,
    functionName: 'supply',
    // ... Aave supply configuration
  },
});
// ONE transaction:
// 1. Bridge USDC from Base to Ethereum
// 2. Approve USDC for Aave
// 3. Supply to Aave
// User signs ONCE, Avail handles the rest!
```

### When to Use Avail vs Vincent Abilities

| Use Case | Solution |
|----------|----------|
| Query balances across chains | Avail Nexus SDK (`getUnifiedBalances`) |
| Transfer tokens to recipient (possibly cross-chain) | Avail Nexus SDK (`transfer`) |
| Bridge tokens between chains | Avail Nexus SDK (`bridge`) |
| Bridge + execute contract call | Avail Nexus SDK (`bridgeAndExecute`) |
| Swap tokens on Uniswap | Vincent Ability (`@lit-protocol/vincent-ability-uniswap-swap`) |
| Supply/borrow on Aave | Vincent Ability (`@lit-protocol/vincent-ability-aave`) |
| Query Aave APYs across chains | Custom integration (Aave Subgraph or RPC calls) |
| Query token prices | Custom integration (Chainlink, Uniswap TWAP) |
| AI decision-making | Custom Vincent Ability (`@deflow/vincent-ability-ai-decision`) |

**Rule of Thumb**: If it involves moving ETH/USDC/USDT across supported chains → use Avail Nexus. If it's a DeFi protocol interaction → use Vincent Ability.

---

## Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DeFlow Frontend (React)                  │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │ Workflow Builder │  │ Node Palette                     │  │
│  │    (Canvas)      │  │ • DeFi: Swap, Aave, Transfer     │  │
│  │                  │  │ • Cross-Chain: Avail nodes       │  │
│  │                  │  │ • Logic: If/Else, Comparison     │  │
│  │                  │  │ • AI: Decision nodes             │  │
│  └──────────────────┘  └─────────────────────────────────┘  │
│            │                                                  │
│            │ (Workflow Definition JSON)                      │
│            ▼                                                  │
└─────────────────────────────────────────────────────────────┘
             │
             │ HTTPS (JWT Auth via Vincent)
             ▼
┌─────────────────────────────────────────────────────────────┐
│              DeFlow Backend (Node.js/Express)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Workflow Orchestrator (Core Engine)          │   │
│  │  • DAG Topological Sort                              │   │
│  │  • Variable Resolution (node outputs → inputs)       │   │
│  │  • Conditional Evaluation (If/Else, Comparison)      │   │
│  │  • Error Handling & Retry Logic                      │   │
│  └──────────────────────────────────────────────────────┘   │
│            │                                                  │
│            ├─────────────────┬────────────────────────────┐  │
│            ▼                 ▼                            ▼  │
│  ┌──────────────────┐ ┌──────────────┐ ┌───────────────┐   │
│  │ Vincent Ability  │ │ Avail Nexus  │ │ Custom Logic  │   │
│  │ Client Manager   │ │ SDK Manager  │ │ Executor      │   │
│  │                  │ │              │ │               │   │
│  │ • Uniswap Swap   │ │ • Unified    │ │ • If/Else     │   │
│  │ • Aave Supply    │ │   Balance    │ │ • Comparison  │   │
│  │ • ERC20 Transfer │ │ • Transfer   │ │ • AI Decision │   │
│  │ • AI Decision    │ │ • Bridge     │ │               │   │
│  │                  │ │ • Bridge+Exec│ │               │   │
│  └──────────────────┘ └──────────────┘ └───────────────┘   │
│            │                 │                            │  │
└─────────────────────────────────────────────────────────────┘
             │                 │
             │                 │ (Both use user's PKP for signing)
             ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│          Lit Protocol Network (Decentralized Nodes)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Lit Actions Runtime (TEEs + MPC-TSS)         │   │
│  │  • Validate policies (spending limit, whitelist)     │   │
│  │  • Execute ability code (swap, supply, transfer)     │   │
│  │  • Sign transaction with user's PKP (threshold sig)  │   │
│  └──────────────────────────────────────────────────────┘   │
│            │                                                  │
└─────────────────────────────────────────────────────────────┘
             │
             ├─────────────────┬────────────────────────────┐
             ▼                 ▼                            ▼
┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐
│  Blockchain      │ │  Avail Nexus     │ │  External Services │
│  Networks        │ │  Solvers         │ │                    │
│                  │ │                  │ │ • OpenAI/Anthropic │
│ • Uniswap V3     │ │ • Cross-chain    │ │   (AI nodes)       │
│ • Aave V3        │ │   routing        │ │ • Chainlink        │
│ • ERC20 contracts│ │ • Intent         │ │   (price feeds)    │
│                  │ │   fulfillment    │ │ • ASI Alliance     │
│ Supported:       │ │ • Liquidity      │ │   (strategy gen)   │
│ - Base           │ │   aggregation    │ │ • Subgraphs        │
│ - Arbitrum       │ │                  │ │   (events)         │
│ - Ethereum       │ │ 11+ chains       │ │                    │
│ - Optimism       │ │ ETH/USDC/USDT    │ │                    │
│ - Polygon        │ │                  │ │                    │
│ - etc.           │ │                  │ │                    │
└──────────────────┘ └──────────────────┘ └────────────────────┘
```

**Key Points**:
1. **Vincent Abilities**: DeFi protocol interactions via Lit Actions
2. **Avail Nexus SDK**: Cross-chain token operations (balances, transfers, bridge+execute)
3. **Custom Logic**: Conditional flow, AI decisions (executed in orchestrator)
4. **Single PKP**: User's Vincent Wallet signs ALL transactions (Vincent abilities + Avail operations)
5. **Parallel Execution**: Orchestrator can call Vincent + Avail simultaneously when dependencies allow

---
             │ (Delegatee signatures + user PKP delegation)
             ▼
┌─────────────────────────────────────────────────────────────┐
│          Lit Protocol Network (Decentralized Nodes)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Lit Actions Runtime (TEEs + MPC-TSS)         │   │
│  │  • Validate policies (spending limit, whitelist)     │   │
│  │  • Execute ability code (swap, supply, transfer)     │   │
│  │  • Sign transaction with user's PKP (threshold sig)  │   │
│  └──────────────────────────────────────────────────────┘   │
│            │                                                  │
└─────────────────────────────────────────────────────────────┘
             │
             │ (Signed transactions)
             ▼
┌─────────────────────────────────────────────────────────────┐
│           Blockchain Networks (Base, Arbitrum, etc.)         │
│  • Uniswap V3 (swaps)                                        │
│  • Aave V3 (lending)                                         │
│  • ERC20 contracts (transfers)                               │
│  • deBridge (cross-chain)                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               External Services (API calls)                  │
│  • OpenAI / Anthropic (AI Decision Node)                     │
│  • Chainlink Price Feeds (Price Oracle Node)                 │
│  • ASI Alliance Agents (Strategy Generation)                 │
│  • Subgraphs (Event monitoring)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Cost Analysis

### User Costs
- **Gas fees**: Paid by user's Vincent Wallet (PKP) - same as if they executed manually
- **Lit Protocol fees**: ~$0.01-0.05 per transaction (threshold signature generation)
- **Vincent delegation**: One-time on-chain transaction (~$1-5 depending on gas)

### DeFlow Operational Costs
- **Delegatee gas**: DeFlow pays gas for delegatee signatures (minimal - just signing attestations)
- **AI API costs**: If using AI nodes ($0.01-0.10 per call depending on model)
- **Infrastructure**: Backend hosting (AWS/Vercel), database, monitoring

### Revenue Model Options
- **Freemium**: Free up to X executions/month, paid plans for power users
- **Transaction fee**: 0.1-0.5% of swap volumes (only for DeFi nodes)
- **Subscription**: $10-50/month for unlimited workflows
- **Enterprise**: Custom pricing for institutional users

---

## Open Questions & Next Steps

### Questions to Resolve
1. **Policy Defaults**: What spending limits should we recommend to users? (e.g., $100/day default?)
2. **AI Provider**: OpenAI vs Anthropic vs open-source LLMs for AI nodes?
3. **Error Handling**: How to handle partial workflow failures? (e.g., swap succeeds but supply fails)
4. **State Persistence**: Where to store intermediate results? (Redis? PostgreSQL?)
5. **Multi-user scaling**: How to queue workflows when Lit Network is congested?

### Immediate Next Steps
1. **Set up Vincent App** on Developer Dashboard (get appId and version)
2. **Create test delegatee EOA** and fund with testnet gas tokens
3. **Build minimal orchestrator** that can execute Uniswap swap ability
4. **Implement Vincent Connect Page** integration in frontend
5. **Test end-to-end flow** on testnet (Base Sepolia)

### Research Needed
- [ ] Review Vincent SDK source code for edge cases
- [ ] Study existing Vincent Apps for best practices
- [ ] Test Lit Network latency (how long do executions take?)
- [ ] Evaluate ASI Alliance agent APIs for strategy generation
- [ ] Investigate Avail Nexus cross-chain message passing

---

## Conclusion

Vincent Protocol provides an excellent foundation for DeFlow's automation engine:

**✅ Pros**:
- Most DeFi abilities already exist (Aave, Uniswap, ERC20)
- Non-custodial (users never expose private keys)
- Policy enforcement (spending limits, whitelists)
- Cross-chain support via PKPs
- Strong TypeScript support and SDK

**❌ Cons**:
- No built-in workflow orchestration (we need to build DAG executor)
- Limited to abilities published in Vincent ecosystem (but can build custom)
- Dependency on Lit Protocol network uptime
- Additional cost for threshold signatures

**Overall Assessment**: Vincent is the right choice for DeFlow. The core DeFi primitives exist, security is robust, and the delegation model aligns perfectly with our automation use case. The orchestration layer is straightforward to build - it's just a backend service that walks a DAG and calls abilities in sequence.

**Recommended Timeline**: 12 weeks from start to production-ready MVP with DeFi nodes, conditional logic, AI integration, and basic ASI Alliance coordination.

**Next Milestone**: Week 1 deliverable - User can connect Vincent Wallet → build simple workflow (swap USDC → WETH) → execute via DeFlow → see confirmed transaction.
