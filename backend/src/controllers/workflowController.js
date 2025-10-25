import { getPKPInfo } from '@lit-protocol/vincent-app-sdk/jwt';
import { ethers } from 'ethers';
import Workflow from '../models/Workflow.js';
import ExecutionHistory from '../models/ExecutionHistory.js';
import { getRpcUrl, getChainId, normalizeTokenAddress } from '../config/chains.js';
import {
  generateSignedUniswapQuote,
  getUniswapSwapAbilityClient,
  getERC20ApprovalAbilityClient,
} from '../config/vincent.js';
import { wrapETH, getWETHBalance } from '../utils/wethWrapper.js';
import { transferNativeToken, transferERC20Token } from '../utils/tokenTransfer.js';

export const getWorkflows = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const workflows = await Workflow.find({ userId: pkpInfo.ethAddress })
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, workflows });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWorkflow = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: pkpInfo.ethAddress,
    });
    
    if (!workflow) {
      return res.status(404).json({ 
        success: false, 
        error: 'Workflow not found' 
      });
    }
    
    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createWorkflow = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const { name, description, nodes, edges, triggers } = req.body;
    
    console.log('📥 Creating workflow:');
    console.log('   Name:', name);
    console.log('   Nodes:', JSON.stringify(nodes, null, 2));
    console.log('   Edges:', JSON.stringify(edges, null, 2));
    
    const workflow = await Workflow.create({
      userId: pkpInfo.ethAddress,
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      triggers: triggers || { type: 'manual' },
    });
    
    console.log('✅ Workflow created with ID:', workflow._id);
    
    res.status(201).json({ success: true, workflow });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const { name, description, nodes, edges, triggers, isActive } = req.body;
    
    console.log('📝 Updating workflow:', req.params.id);
    console.log('   Name:', name);
    console.log('   Nodes:', JSON.stringify(nodes, null, 2));
    console.log('   Edges:', JSON.stringify(edges, null, 2));
    
    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, userId: pkpInfo.ethAddress },
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(nodes && { nodes }),
        ...(edges && { edges }),
        ...(triggers && { triggers }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );
    
    if (!workflow) {
      return res.status(404).json({ 
        success: false, 
        error: 'Workflow not found' 
      });
    }
    
    console.log('✅ Workflow updated');
    
    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const workflow = await Workflow.findOneAndDelete({
      _id: req.params.id,
      userId: pkpInfo.ethAddress,
    });
    
    if (!workflow) {
      return res.status(404).json({ 
        success: false, 
        error: 'Workflow not found' 
      });
    }
    
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExecutionHistory = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const { workflowId } = req.params;
    
    // Build query based on whether workflowId is provided
    const query = { userId: pkpInfo.ethAddress };
    if (workflowId) {
      query.workflowId = workflowId;
    }
    
    const executions = await ExecutionHistory.find(query)
      .populate('workflow', 'name')
      .sort({ startedAt: -1 })
      .limit(50);
    
    res.json({ success: true, executions });
  } catch (error) {
    console.error('Get execution history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExecutionDetails = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const { executionId } = req.params;
    
    const execution = await ExecutionHistory.findOne({
      _id: executionId,
      userId: pkpInfo.ethAddress,
    }).populate('workflow', 'name description');
    
    if (!execution) {
      return res.status(404).json({ 
        success: false, 
        error: 'Execution not found' 
      });
    }
    
    res.json({ success: true, execution });
  } catch (error) {
    console.error('Get execution details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const executeWorkflow = async (req, res) => {
  try {
    const pkpInfo = getPKPInfo(req.vincentUser.decodedJWT);
    const workflowId = req.params.id;
    
    // Find the workflow
    const workflow = await Workflow.findOne({
      _id: workflowId,
      userId: pkpInfo.ethAddress,
    });
    
    if (!workflow) {
      return res.status(404).json({ 
        success: false, 
        error: 'Workflow not found' 
      });
    }
    
    // Note: Manual trigger workflows don't need to be active to execute
    // Only scheduled/automated workflows need to be active
    
    // Create execution history record
    const execution = await ExecutionHistory.create({
      workflowId,
      userId: pkpInfo.ethAddress,
      workflow: workflowId,
      status: 'running',
      startedAt: new Date(),
      steps: [],
    });
    
    console.log('='.repeat(80));
    console.log(`🚀 WORKFLOW EXECUTION STARTED`);
    console.log(`   Workflow: ${workflow.name} (${workflow._id})`);
    console.log(`   Execution ID: ${execution._id}`);
    console.log(`   User: ${pkpInfo.ethAddress}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    
    // Start async execution (don't wait for it to complete)
    executeWorkflowAsync(workflow, execution, pkpInfo).catch(err => {
      console.error('❌ Workflow execution error:', err);
    });
    
    res.json({ 
      success: true, 
      executionId: execution._id,
      message: 'Workflow execution started' 
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Async workflow execution function
async function executeWorkflowAsync(workflow, execution, pkpInfo) {
  try {
    console.log(`\n📋 Building execution graph...`);
    console.log(`   Total nodes: ${workflow.nodes.length}`);
    console.log(`   Total edges: ${workflow.edges.length}`);
    
    // Find the trigger node to start execution
    const triggerNode = workflow.nodes.find(node => node.type === 'trigger');
    if (!triggerNode) {
      throw new Error('No trigger node found in workflow');
    }
    console.log(`   ✓ Trigger node found: ${triggerNode.label || triggerNode.id}`);
    
    // Build execution graph from nodes and edges
    const nodeMap = new Map(workflow.nodes.map(node => [node.id, node]));
    const edgeMap = new Map();
    
    // Group edges by source node for easy lookup
    workflow.edges.forEach(edge => {
      if (!edgeMap.has(edge.from)) {
        edgeMap.set(edge.from, []);
      }
      edgeMap.get(edge.from).push(edge);
    });
    
    console.log(`   ✓ Execution graph built\n`);
    
    // Execute nodes starting from trigger
    const executionSteps = [];
    const executionContext = new Map(); // Store outputs from each node
    await executeNode(triggerNode, nodeMap, edgeMap, executionSteps, pkpInfo, executionContext);
    
    // Update execution history with success
    await ExecutionHistory.findByIdAndUpdate(execution._id, {
      status: 'completed',
      completedAt: new Date(),
      steps: executionSteps,
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ WORKFLOW EXECUTION COMPLETED`);
    console.log(`   Execution ID: ${execution._id}`);
    console.log(`   Total steps: ${executionSteps.length}`);
    console.log(`   Duration: ${new Date() - execution.startedAt}ms`);
    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ WORKFLOW EXECUTION FAILED');
    console.error(`   Execution ID: ${execution._id}`);
    console.error(`   Error: ${error.message}`);
    console.error('='.repeat(80));
    console.error('Stack trace:', error.stack);
    
    // Update execution history with error
    await ExecutionHistory.findByIdAndUpdate(execution._id, {
      status: 'failed',
      completedAt: new Date(),
      error: error.message,
    });
  }
}

// Execute a single node and its children
async function executeNode(node, nodeMap, edgeMap, executionSteps, pkpInfo, executionContext = new Map()) {
  const stepStartTime = new Date();
  console.log(`\n┌─ Executing Node: ${node.label || node.type}`);
  console.log(`│  ID: ${node.id}`);
  console.log(`│  Type: ${node.type}`);
  console.log(`│  Config:`, JSON.stringify(node.config || {}, null, 2).split('\n').map((line, i) => i === 0 ? line : `│  ${line}`).join('\n'));
  
  // Get output from previous node(s) if available
  const incomingEdges = Array.from(edgeMap.values()).flat().filter(edge => edge.to === node.id);
  const previousOutputs = incomingEdges.map(edge => executionContext.get(edge.from)).filter(Boolean);
  
  if (previousOutputs.length > 0) {
    console.log(`│  Previous outputs:`, JSON.stringify(previousOutputs, null, 2).split('\n').map((line, i) => i === 0 ? line : `│  ${line}`).join('\n'));
  }
  
  try {
    let result;
    
    // Execute based on node type, passing previous outputs
    switch (node.type) {
      case 'trigger':
        result = { success: true, message: 'Workflow triggered manually' };
        console.log(`│  ✓ Trigger executed`);
        break;
        
      case 'swap':
        result = await executeSwapNode(node, pkpInfo, previousOutputs);
        console.log(`│  ✓ Swap executed:`, result);
        break;
        
      case 'aave':
        result = await executeAaveNode(node, pkpInfo, previousOutputs);
        console.log(`│  ✓ Aave executed:`, result);
        break;
        
      case 'transfer':
        result = await executeTransferNode(node, pkpInfo, previousOutputs);
        console.log(`│  ✓ Transfer executed:`, result);
        break;
        
      case 'condition':
        result = await executeConditionNode(node, pkpInfo, previousOutputs);
        console.log(`│  ✓ Condition evaluated:`, result);
        break;
        
      case 'ai':
        result = await executeAINode(node, pkpInfo, previousOutputs);
        console.log(`│  ✓ AI executed:`, result);
        break;
        
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
    
    // Store output in execution context for next nodes
    executionContext.set(node.id, result);
    
    const stepDuration = new Date() - stepStartTime;
    console.log(`│  Duration: ${stepDuration}ms`);
    console.log(`└─ ✓ Success\n`);
    
    // Record execution step
    executionSteps.push({
      nodeId: node.id,
      nodeType: node.type,
      nodeLabel: node.label,
      status: 'success',
      startedAt: stepStartTime,
      completedAt: new Date(),
      output: result,
    });
    
    // Find and execute next nodes
    const outgoingEdges = edgeMap.get(node.id) || [];
    console.log(`   → Outgoing edges: ${outgoingEdges.length}`);
    
    // For condition nodes, follow the appropriate branch
    if (node.type === 'condition' && result.conditionMet !== undefined) {
      const branchEdge = outgoingEdges.find(edge => 
        edge.sourceHandle === (result.conditionMet ? 'true' : 'false')
      );
      if (branchEdge) {
        console.log(`   → Following ${result.conditionMet ? 'TRUE' : 'FALSE'} branch to node ${branchEdge.to}`);
        const nextNode = nodeMap.get(branchEdge.to);
        if (nextNode) {
          await executeNode(nextNode, nodeMap, edgeMap, executionSteps, pkpInfo, executionContext);
        }
      } else {
        console.log(`   → No ${result.conditionMet ? 'TRUE' : 'FALSE'} branch found`);
      }
    } else {
      // For other nodes, execute all connected nodes
      for (const edge of outgoingEdges) {
        console.log(`   → Following edge to node ${edge.to}`);
        const nextNode = nodeMap.get(edge.to);
        if (nextNode) {
          await executeNode(nextNode, nodeMap, edgeMap, executionSteps, pkpInfo, executionContext);
        }
      }
    }
    
  } catch (error) {
    const stepDuration = new Date() - stepStartTime;
    console.error(`└─ ✗ Failed after ${stepDuration}ms`);
    console.error(`   Error: ${error.message}\n`);
    
    executionSteps.push({
      nodeId: node.id,
      nodeType: node.type,
      nodeLabel: node.label,
      status: 'failed',
      startedAt: stepStartTime,
      completedAt: new Date(),
      error: error.message,
    });
    
    throw error; // Propagate error to stop workflow
  }
}

// Helper function to extract token symbol from address or existing symbol
function getTokenSymbol(tokenAddressOrSymbol) {
  if (!tokenAddressOrSymbol) return 'UNKNOWN';
  
  // If it's already a symbol (short string without 0x), return it
  if (!tokenAddressOrSymbol.startsWith('0x')) {
    return tokenAddressOrSymbol;
  }
  
  // Token symbol mapping (Base network)
  const tokenMap = {
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ETH',
    '0x4200000000000000000000000000000000000006': 'WETH',
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
    '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2': 'USDT',
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'DAI',
  };
  
  return tokenMap[tokenAddressOrSymbol.toLowerCase()] || 'UNKNOWN';
}

// Node-specific execution functions
async function executeSwapNode(node, pkpInfo) {
  const config = node.config || {};
  
  // Validate required configuration
  if (!config.fromToken || !config.toToken || !config.amount) {
    throw new Error('Swap node missing required configuration (fromToken, toToken, amount)');
  }
  
  if (!config.chain) {
    throw new Error('Swap node missing chain configuration');
  }
  
  console.log('   [Swap] Executing Uniswap swap via Vincent SDK...');
  console.log(`   Chain: ${config.chain}`);
  console.log(`   From: ${config.amount} ${config.fromToken}`);
  console.log(`   To: ${config.toToken}`);
  console.log(`   Slippage: ${config.slippage || 0.5}%`);
  
  try {
    // Get chain configuration
    const rpcUrl = getRpcUrl(config.chain);
    const chainId = getChainId(config.chain);
    const delegatorPkpEthAddress = pkpInfo.ethAddress;
    
    // Normalize token addresses (convert native ETH placeholder to WETH)
    const normalizedFromToken = normalizeTokenAddress(config.chain, config.fromToken);
    const normalizedToToken = normalizeTokenAddress(config.chain, config.toToken);
    
    console.log(`   → Normalized addresses:`);
    console.log(`     From: ${config.fromToken} → ${normalizedFromToken}`);
    console.log(`     To: ${config.toToken} → ${normalizedToToken}`);
    
    // Check if we need to wrap ETH to WETH
    console.log(`   → Checking if wrapping needed...`);
    console.log(`     config.fromToken: ${config.fromToken}`);
    console.log(`     normalizedFromToken (WETH): ${normalizedFromToken}`);
    
    const isNativeETH = config.fromToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    const isWETH = normalizedFromToken.toLowerCase() !== config.fromToken.toLowerCase();
    
    console.log(`     isNativeETH: ${isNativeETH}`);
    console.log(`     isWETH (needs wrapping): ${isWETH}`);
    
    let wrapTxHash = null;
    
    // Wrap if user selected native ETH OR if they selected WETH (which requires wrapping)
    if (isNativeETH || isWETH) {
      console.log(`   → Step 1: Wrapping ETH to WETH...`);
      console.log(`     Amount: ${config.amount} ETH`);
      
      try {
        const wrapResult = await wrapETH({
          chainName: config.chain,
          amount: config.amount.toString(),
          userPkpAddress: delegatorPkpEthAddress,
        });
        
        if (!wrapResult.success) {
          throw new Error(`ETH wrapping failed: ${wrapResult.error || 'Unknown error'}`);
        }
        
        wrapTxHash = wrapResult.txHash;
        console.log(`   ✓ ETH wrapped successfully: ${wrapTxHash}`);
        console.log(`     WETH address: ${wrapResult.wethAddress}`);
        
        // Check WETH balance after wrapping
        const balanceCheck = await getWETHBalance({
          chainName: config.chain,
          userPkpAddress: delegatorPkpEthAddress,
        });
        
        if (balanceCheck.success) {
          console.log(`     WETH balance: ${balanceCheck.balance} WETH`);
        }
      } catch (error) {
        console.error(`   ✗ ETH wrapping failed:`, error.message);
        throw new Error(`Failed to wrap ETH before swap: ${error.message}`);
      }
    }
    
    // Convert slippage percentage to basis points (1% = 100 basis points)
    const slippageBps = Math.round((parseFloat(config.slippage) || 0.5) * 100);
    
    const quoteStepNumber = isNativeETH ? 2 : 1;
    console.log(`   → Step ${quoteStepNumber}: Generating signed Uniswap quote...`);
    
    // Generate signed quote using Vincent SDK
    const signedUniswapQuote = await generateSignedUniswapQuote({
      rpcUrl,
      tokenInAddress: normalizedFromToken,
      tokenInAmount: config.amount,
      tokenOutAddress: normalizedToToken,
      recipient: delegatorPkpEthAddress,
      slippageTolerance: slippageBps,
    });
    
    const uniswapRouterAddress = signedUniswapQuote.quote.to;
    console.log(`   ✓ Quote generated: ${signedUniswapQuote.quote.amountOut} expected`);
    
    const approvalStepNumber = isNativeETH ? 3 : 2;
    console.log(`   → Step ${approvalStepNumber}: Checking ERC20 approval...`);
    
    // Check and approve ERC20 if needed
    const erc20ApprovalClient = getERC20ApprovalAbilityClient();
    
    // Parse the token amount to the smallest unit (wei-like)
    // Assuming 18 decimals for now - in production, fetch from token contract
    const tokenDecimals = config.fromTokenDecimals || 18;
    const tokenAmountWei = ethers.utils.parseUnits(
      config.amount.toString(), 
      tokenDecimals
    ).toString();
    
    const approvalPrecheckResult = await erc20ApprovalClient.precheck(
      {
        rpcUrl,
        chainId,
        spenderAddress: uniswapRouterAddress,
        tokenAddress: normalizedFromToken,
        tokenAmount: tokenAmountWei,
        alchemyGasSponsor: false,
      },
      {
        delegatorPkpEthAddress,
      }
    );
    
    console.log(`   Approval precheck result:`, approvalPrecheckResult.success ? 'Success' : 'Failed');
    
    if (!approvalPrecheckResult.success) {
      throw new Error(`Approval precheck failed: ${approvalPrecheckResult.runtimeError || 'Unknown error'}`);
    }
    
    if ('noNativeTokenBalance' in approvalPrecheckResult.result) {
      throw new Error('Vincent Wallet has no native token balance for gas fees');
    }
    
    let approvalTxHash = null;
    
    if (!approvalPrecheckResult.result.alreadyApproved) {
      console.log(`   → Executing ERC20 approval...`);
      
      const approvalExecutionResult = await erc20ApprovalClient.execute(
        {
          rpcUrl,
          chainId,
          spenderAddress: uniswapRouterAddress,
          tokenAddress: normalizedFromToken,
          tokenAmount: tokenAmountWei,
          alchemyGasSponsor: false,
        },
        {
          delegatorPkpEthAddress,
        }
      );
      
      if (!approvalExecutionResult.success) {
        throw new Error(`Approval execution failed: ${approvalExecutionResult.runtimeError || 'Unknown error'}`);
      }
      
      approvalTxHash = approvalExecutionResult.result.approvalTxHash;
      console.log(`   ✓ ERC20 approval successful: ${approvalTxHash}`);
    } else {
      console.log(`   ✓ Sufficient allowance already exists`);
    }
    
    const swapStepNumber = isNativeETH ? 4 : 3;
    console.log(`   → Step ${swapStepNumber}: Executing Uniswap swap...`);
    
    // Execute the swap
    const uniswapSwapClient = getUniswapSwapAbilityClient();
    
    const swapExecutionResult = await uniswapSwapClient.execute(
      {
        rpcUrlForUniswap: rpcUrl,
        signedUniswapQuote: {
          quote: signedUniswapQuote.quote,
          signature: signedUniswapQuote.signature,
        },
      },
      {
        delegatorPkpEthAddress,
      }
    );
    
    if (!swapExecutionResult.success) {
      throw new Error(`Swap execution failed: ${swapExecutionResult.runtimeError || 'Unknown error'}`);
    }
    
    const swapTxHash = swapExecutionResult.result.swapTxHash;
    console.log(`   ✓ Swap successful: ${swapTxHash}`);
    
    // Calculate actual amount received (amountOut from quote)
    const amountOutWei = signedUniswapQuote.quote.amountOut;
    const toTokenDecimals = config.toTokenDecimals || 18;
    const amountOut = (BigInt(amountOutWei) / BigInt(10 ** parseInt(toTokenDecimals))).toString();
    
    return {
      success: true,
      message: 'Swap executed successfully via Uniswap V3',
      chain: config.chain,
      fromToken: config.fromToken,
      toToken: config.toToken,
      amountIn: config.amount,
      expectedAmountOut: signedUniswapQuote.quote.amountOut,
      slippage: config.slippage || 0.5,
      wrapTxHash, // null if no wrapping was needed
      approvalTxHash,
      swapTxHash,
      uniswapRouter: uniswapRouterAddress,
      // Standardized output data for next nodes
      output: {
        tokenReceived: normalizedToToken,
        tokenSymbol: getTokenSymbol(config.toToken), // Helper to extract symbol
        amountReceived: amountOut,
        amountReceivedWei: amountOutWei,
        decimals: toTokenDecimals,
      }
    };
  } catch (error) {
    console.error(`   ✗ Swap failed:`, error.message);
    throw new Error(`Swap execution failed: ${error.message}`);
  }
}

async function executeAaveNode(node, pkpInfo, previousOutputs = []) {
  // TODO: Implement actual Aave interaction
  const config = node.config || {};
  
  if (!config.action || !config.asset) {
    throw new Error('Aave node missing required configuration (action, asset)');
  }
  
  // Get amount from previous node if not specified
  let amount = config.amount;
  if (!amount || amount === '') {
    // Try to get amount from previous swap/withdraw node
    const previousOutput = previousOutputs.find(out => out && out.output);
    if (previousOutput && previousOutput.output.amountReceived) {
      amount = previousOutput.output.amountReceived;
      console.log(`   [Aave] Using amount from previous node: ${amount}`);
    }
  }
  
  if (!amount) {
    throw new Error('Aave node missing amount (not specified and no previous output)');
  }
  
  console.log('   [Aave] Executing Aave:', config.action, config.asset, amount);
  
  // Determine output based on action
  let output;
  if (config.action === 'supply') {
    output = {
      aTokenReceived: `a${config.asset}`,
      amountReceived: amount,
      tokenSymbol: `a${config.asset}`,
    };
  } else if (config.action === 'withdraw') {
    output = {
      tokenReceived: config.asset,
      amountReceived: amount,
      tokenSymbol: config.asset,
    };
  } else if (config.action === 'borrow') {
    output = {
      tokenBorrowed: config.asset,
      amountBorrowed: amount,
      tokenSymbol: config.asset,
    };
  } else if (config.action === 'repay') {
    output = {
      tokenRepaid: config.asset,
      amountRepaid: amount,
    };
  }
  
  return {
    success: true,
    message: `Aave ${config.action} executed (stub)`,
    action: config.action,
    asset: config.asset,
    amount: amount,
    useAsCollateral: config.useAsCollateral || false,
    output,
  };
}

async function executeTransferNode(node, pkpInfo) {
  const startTime = Date.now();
  const config = node.config || {};
  
  console.log('   [Transfer] Executing token transfer...');
  console.log(`   Chain: ${config.chain || 'Not specified'}`);
  console.log(`   Token: ${config.token || 'Not specified'}`);
  console.log(`   To: ${config.recipient || 'Not specified'}`);
  console.log(`   Amount: ${config.amount || 'Not specified'}`);
  
  // Validate required fields
  if (!config.chain) {
    throw new Error('Transfer node missing required configuration: chain');
  }
  if (!config.token) {
    throw new Error('Transfer node missing required configuration: token');
  }
  if (!config.recipient) {
    throw new Error('Transfer node missing required configuration: recipient');
  }
  if (!config.amount) {
    throw new Error('Transfer node missing required configuration: amount');
  }

  // Validate recipient address format
  if (!ethers.utils.isAddress(config.recipient)) {
    throw new Error(`Invalid recipient address: ${config.recipient}`);
  }

  // Get PKP address
  const delegatorPkpEthAddress = pkpInfo.ethAddress;

  try {
    // Determine if this is a native token or ERC20 transfer
    const isNativeETH = config.token.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
                        config.token.toLowerCase() === 'eth';

    let transferResult;

    if (isNativeETH) {
      // Transfer native ETH
      console.log('   → Transferring native ETH...');
      
      transferResult = await transferNativeToken({
        chainName: config.chain,
        recipient: config.recipient,
        amount: config.amount.toString(),
        userPkpAddress: delegatorPkpEthAddress,
      });
    } else {
      // Transfer ERC20 token
      console.log('   → Transferring ERC20 token...');
      
      // Assume config.token is the token address for ERC20
      transferResult = await transferERC20Token({
        chainName: config.chain,
        tokenAddress: config.token,
        recipient: config.recipient,
        amount: config.amount.toString(),
        userPkpAddress: delegatorPkpEthAddress,
      });
    }

    if (!transferResult.success) {
      throw new Error(transferResult.error || 'Transfer failed');
    }

    const duration = Date.now() - startTime;
    console.log(`   ✓ Transfer completed successfully!`);
    console.log(`   Tx Hash: ${transferResult.txHash}`);
    console.log(`   Block: ${transferResult.blockNumber}`);
    console.log(`   Gas Used: ${transferResult.gasUsed}`);

    return {
      success: true,
      txHash: transferResult.txHash,
      recipient: config.recipient,
      amount: config.amount,
      token: transferResult.token || config.token,
      blockNumber: transferResult.blockNumber,
      gasUsed: transferResult.gasUsed,
      duration,
    };
  } catch (error) {
    console.error('   ✗ Transfer failed:', error.message);
    throw new Error(`Transfer execution failed: ${error.message}`);
  }
}

async function executeConditionNode(node, pkpInfo) {
  // TODO: Implement actual condition evaluation
  const config = node.config || {};
  
  if (!config.leftValue || !config.operator || !config.rightValue) {
    throw new Error('Condition node missing required configuration (leftValue, operator, rightValue)');
  }
  
  console.log('   [Condition] Evaluating condition:', config);
  
  // Simple stub evaluation - always returns true for now
  const conditionMet = true;
  
  return {
    success: true,
    conditionMet,
    leftValue: config.leftValue,
    operator: config.operator,
    rightValue: config.rightValue,
  };
}

async function executeAINode(node, pkpInfo) {
  // TODO: Implement actual AI agent call
  const config = node.config || {};
  
  if (!config.systemPrompt || !config.userPrompt) {
    throw new Error('AI node missing required configuration (systemPrompt, userPrompt)');
  }
  
  console.log('   [AI] Executing AI:', config);
  
  return {
    success: true,
    message: 'AI agent executed (stub)',
    systemPrompt: config.systemPrompt,
    userPrompt: config.userPrompt,
    outputFormat: config.outputFormat || 'text',
    response: 'AI response placeholder',
  };
}

