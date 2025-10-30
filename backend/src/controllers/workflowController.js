import { getPKPInfo } from '@lit-protocol/vincent-app-sdk/jwt';
import { ethers } from 'ethers';
import * as AaveAddressBook from '@bgd-labs/aave-address-book';
import Workflow from '../models/Workflow.js';
import ExecutionHistory from '../models/ExecutionHistory.js';
import { getRpcUrl, getChainId, normalizeTokenAddress } from '../config/chains.js';
import {
  generateSignedUniswapQuote,
  getUniswapSwapAbilityClient,
  getERC20ApprovalAbilityClient,
  getAaveAbilityClient,
} from '../config/vincent.js';
import { wrapETH, getWETHBalance } from '../utils/wethWrapper.js';
import { transferNativeToken, transferERC20Token } from '../utils/tokenTransfer.js';
import { resolveAaveToken } from '../config/aaveTokens.js';

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
        result = await executeConditionNode(node, pkpInfo, previousOutputs, nodeMap, edgeMap);
        console.log(`│  ✓ Condition evaluated:`, result);
        break;
        
      case 'ai':
        result = await executeAINode(node, pkpInfo, previousOutputs, nodeMap, edgeMap);
        console.log(`│  ✓ AI executed:`, result);
        break;
        
      case 'mcp':
        result = await executeMCPNode(node, pkpInfo, previousOutputs);
        console.log(`│  ✓ MCP executed:`, result);
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
async function executeSwapNode(node, pkpInfo, previousOutputs = []) {
  const config = node.config || {};
  
  // Validate required configuration
  if (!config.fromToken || !config.toToken) {
    throw new Error('Swap node missing required configuration (fromToken, toToken)');
  }
  
  if (!config.chain) {
    throw new Error('Swap node missing chain configuration');
  }
  
  // Determine amount: use config.amount or pull from previous output
  let amount = config.amount;
  
  if (!amount && previousOutputs.length > 0) {
    // Try to get amount from the last output that has tokenReceived matching our fromToken
    const lastOutput = previousOutputs[previousOutputs.length - 1];
    
    if (lastOutput?.output?.amountReceived) {
      amount = lastOutput.output.amountReceived;
      console.log(`   [Swap] Using amount from previous node: ${amount}`);
      
      // Also use the token received as fromToken if it matches
      if (lastOutput.output.tokenReceived) {
        const normalizedFromToken = normalizeTokenAddress(config.fromToken, config.chain);
        const normalizedPrevToken = normalizeTokenAddress(lastOutput.output.tokenReceived, config.chain);
        
        if (normalizedFromToken.toLowerCase() === normalizedPrevToken.toLowerCase()) {
          console.log(`   [Swap] Token match confirmed: ${normalizedFromToken}`);
        }
      }
    }
  }
  
  if (!amount) {
    throw new Error('Swap node missing amount (not in config and not available from previous outputs)');
  }
  
  console.log('   [Swap] Executing Uniswap swap via Vincent SDK...');
  console.log(`   Chain: ${config.chain}`);
  console.log(`   From: ${amount} ${config.fromToken}`);
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
      console.log(`     Amount: ${amount} ETH`);
      
      try {
        const wrapResult = await wrapETH({
          chainName: config.chain,
          amount: amount.toString(),
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
      tokenInAmount: amount,
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
      amount.toString(), 
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
    
    // Handle amountOut conversion safely - could be string, number, or BigInt
    let amountOut;
    try {
      // If it's already a decimal string or number, use it directly
      if (typeof amountOutWei === 'string' && amountOutWei.includes('.')) {
        amountOut = amountOutWei;
      } else if (typeof amountOutWei === 'number') {
        amountOut = amountOutWei.toString();
      } else {
        // Otherwise assume it's wei and convert using ethers
        amountOut = ethers.formatUnits(amountOutWei.toString(), toTokenDecimals);
      }
    } catch (err) {
      console.warn('   ⚠ Error converting amountOut, using raw value:', err.message);
      amountOut = amountOutWei.toString();
    }
    
    return {
      success: true,
      message: 'Swap executed successfully via Uniswap V3',
      chain: config.chain,
      chainId: getChainId(config.chain),
      fromToken: config.fromToken,
      toToken: config.toToken,
      amountIn: amount,
      expectedAmountOut: signedUniswapQuote.quote.amountOut,
      slippage: config.slippage || 0.5,
      wrapTxHash, // null if no wrapping was needed
      approvalTxHash,
      swapTxHash,
      txHash: swapTxHash, // Primary transaction hash for notifications
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
  const config = node.config || {};
  
  if (!config.action || !config.asset) {
    throw new Error('Aave node missing required configuration (action, asset)');
  }
  
  if (!config.chain) {
    throw new Error('Aave node missing chain configuration');
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
  
  console.log('   [Aave] Executing Aave operation via Vincent SDK...');
  console.log(`   Chain: ${config.chain}`);
  console.log(`   Operation: ${config.action}`);
  console.log(`   Asset: ${config.asset}`);
  console.log(`   Amount: ${amount}`);
  
  try {
    const rpcUrl = getRpcUrl(config.chain);
    const chainId = getChainId(config.chain);
    const delegatorPkpEthAddress = pkpInfo.ethAddress;
    
    // Resolve token symbol to address if needed (e.g., "USDC" -> "0x...")
    const assetAddress = resolveAaveToken(config.chain, config.asset);
    console.log(`   Resolved asset address: ${assetAddress}`);
    
    // Get Aave ability client
    const aaveClient = getAaveAbilityClient();
    
    // Prepare parameters for Aave ability
    // Note: Aave ability expects human-readable amounts (e.g., "0.01"), not wei
    const aaveParams = {
      operation: config.action, // 'supply', 'withdraw', 'borrow', 'repay'
      asset: assetAddress, // Token contract address
      amount: amount.toString(), // Human-readable amount (e.g., "0.001")
      chain: config.chain,
      rpcUrl, // RPC URL for the chain (required by Aave ability for precheck)
    };
    
    // Add interestRateMode for borrow/repay (1=Stable, 2=Variable)
    if (config.action === 'borrow' || config.action === 'repay') {
      aaveParams.interestRateMode = config.interestRateMode || 2; // Default to variable rate
    }
    
    console.log(`   Aave params:`, JSON.stringify(aaveParams, null, 2));
    console.log(`   PKP Address:`, delegatorPkpEthAddress);
    
    console.log(`   → Step 1: Running Aave precheck...`);
    
    // Run precheck - do NOT pass rpcUrl, it's handled internally by the ability
    let precheckResult;
    try {
      precheckResult = await aaveClient.precheck(
        aaveParams,
        {
          delegatorPkpEthAddress,
        }
      );
    } catch (err) {
      console.error(`   ✗ Precheck error:`, err);
      throw new Error(`Aave precheck failed: ${err.message}`);
    }
    
    console.log(`   Precheck result:`, JSON.stringify(precheckResult, null, 2));
    
    // Check if precheck failed due to insufficient allowance
    if (!precheckResult.success) {
      const errorMsg = precheckResult.result?.error || precheckResult.runtimeError || precheckResult.error || 'Unknown error';
      
      // Check if it's an allowance issue for supply or repay operations
      const isAllowanceError = errorMsg.includes('Insufficient allowance') || 
                                errorMsg.includes('approve') || 
                                errorMsg.includes('allowance');
      const needsApproval = (config.action === 'supply' || config.action === 'repay') && isAllowanceError;
      
      if (needsApproval) {
        console.log(`   ⚠️  Insufficient allowance detected - handling ERC20 approval...`);
        
        // Get Aave Pool address from the official Aave address book
        // Using the same source as the vincent-ability-aave package
        let aavePoolAddress;
        try {
          const chainMap = {
            ethereum: 'AaveV3Ethereum',
            sepolia: 'AaveV3Sepolia',
            polygon: 'AaveV3Polygon',
            arbitrum: 'AaveV3Arbitrum',
            optimism: 'AaveV3Optimism',
            base: 'AaveV3Base',
            basesepolia: 'AaveV3BaseSepolia',
            avalanche: 'AaveV3Avalanche',
            avalanchefuji: 'AaveV3AvalancheFuji',
          };
          
          const addressBookKey = chainMap[config.chain];
          if (!addressBookKey || !AaveAddressBook[addressBookKey]) {
            throw new Error(`Aave address book not found for chain: ${config.chain}`);
          }
          
          aavePoolAddress = AaveAddressBook[addressBookKey].POOL;
          console.log(`   → Using official Aave Pool address: ${aavePoolAddress}`);
        } catch (error) {
          console.error(`   ✗ Failed to get Aave Pool address:`, error.message);
          throw new Error(`Failed to get Aave Pool address for chain ${config.chain}: ${error.message}`);
        }
        
        console.log(`   → Aave Pool address: ${aavePoolAddress}`);
        console.log(`   → Approving ${assetAddress} for Aave Pool...`);
        
        try {
          const erc20ApprovalClient = getERC20ApprovalAbilityClient();
          
          // Calculate amount in wei for approval (ERC20 approval needs wei, but Aave ability uses human-readable)
          const decimals = assetAddress.toLowerCase().includes('usdc') || 
                          assetAddress.toLowerCase().includes('usdt') ? 6 : 18;
          const amountWei = ethers.utils.parseUnits(amount.toString(), decimals).toString();
          
          console.log(`   → Token decimals: ${decimals}`);
          console.log(`   → Amount for approval: ${amount} ${config.asset} = ${amountWei} wei`);
          
          // Use max approval to avoid future approval transactions
          const maxApproval = ethers.constants.MaxUint256.toString();
          console.log(`   → Using max approval for future-proofing: ${maxApproval}`);
          
          // Execute approval
          const approvalResult = await erc20ApprovalClient.execute(
            {
              rpcUrl,
              chainId,
              spenderAddress: aavePoolAddress,
              tokenAddress: assetAddress,
              tokenAmount: maxApproval, // Use max approval instead of exact amount
              alchemyGasSponsor: false,
            },
            {
              delegatorPkpEthAddress,
            }
          );
          
          if (!approvalResult.success) {
            throw new Error(`Approval failed: ${approvalResult.runtimeError || 'Unknown error'}`);
          }
          
          const txHash = approvalResult.result?.approvalTxHash || approvalResult.result?.txHash;
          console.log(`   ✓ ERC20 approval successful`);
          if (txHash) {
            console.log(`   → Approval TX: ${txHash}`);
          }
          console.log(`   → Approved amount: ${amountWei} wei (${amount} ${config.asset})`);
          
          // Wait a bit for the approval to propagate (blockchain confirmation)
          console.log(`   → Waiting 3 seconds for approval to confirm...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          console.log(`   → Retrying Aave precheck after approval...`);
          
          // Retry precheck after approval
          precheckResult = await aaveClient.precheck(
            aaveParams,
            {
              delegatorPkpEthAddress,
            }
          );
          
          console.log(`   Retry precheck result:`, precheckResult.success ? 'Success' : 'Failed');
          if (!precheckResult.success) {
            console.log(`   Retry precheck error:`, precheckResult.result?.error || precheckResult.runtimeError);
          }
        } catch (approvalError) {
          console.error(`   ✗ Approval failed:`, approvalError.message);
          throw new Error(`Failed to approve tokens for Aave: ${approvalError.message}`);
        }
      }
      
      // Check if precheck still failed after approval attempt
      if (!precheckResult.success) {
        const finalErrorMsg = precheckResult.result?.error || precheckResult.runtimeError || precheckResult.error || 'Unknown error';
        console.error(`   ✗ Precheck failed:`, finalErrorMsg);
        throw new Error(`Aave precheck failed: ${finalErrorMsg}`);
      }
    }
    
    // Log precheck details
    if (precheckResult.result) {
      console.log(`   Precheck details:`, JSON.stringify(precheckResult.result, null, 2));
      
      if (precheckResult.result.userBalance) {
        console.log(`   User balance: ${precheckResult.result.userBalance}`);
      }
      if (precheckResult.result.borrowCapacity) {
        console.log(`   Borrow capacity: ${precheckResult.result.borrowCapacity}`);
      }
    }
    
    console.log(`   → Step 2: Executing Aave ${config.action}...`);
    
    // Execute the operation - do NOT pass rpcUrl, it's handled internally
    const executeResult = await aaveClient.execute(
      aaveParams,
      {
        delegatorPkpEthAddress,
      }
    );
    
    if (!executeResult.success) {
      throw new Error(`Aave execution failed: ${executeResult.runtimeError || 'Unknown error'}`);
    }
    
    const txHash = executeResult.result.data.txHash;
    console.log(`   ✓ Aave ${config.action} successful: ${txHash}`);
    
    // Determine output based on action
    let output;
    if (config.action === 'supply') {
      output = {
        aTokenReceived: `a${getTokenSymbol(config.asset)}`,
        amountReceived: amount,
        tokenSymbol: `a${getTokenSymbol(config.asset)}`,
      };
    } else if (config.action === 'withdraw') {
      output = {
        tokenReceived: config.asset,
        amountReceived: amount,
        tokenSymbol: getTokenSymbol(config.asset),
      };
    } else if (config.action === 'borrow') {
      output = {
        tokenBorrowed: config.asset,
        amountBorrowed: amount,
        tokenSymbol: getTokenSymbol(config.asset),
      };
    } else if (config.action === 'repay') {
      output = {
        tokenRepaid: config.asset,
        amountRepaid: amount,
      };
    }
    
    return {
      success: true,
      message: `Aave ${config.action} executed successfully`,
      chain: config.chain,
      chainId: getChainId(config.chain),
      action: config.action,
      asset: config.asset,
      amount: amount,
      txHash,
      interestRateMode: aaveParams.interestRateMode,
      useAsCollateral: config.useAsCollateral || false,
      output,
    };
  } catch (error) {
    console.error(`   ✗ Aave ${config.action} failed:`, error.message);
    throw new Error(`Aave execution failed: ${error.message}`);
  }
}

async function executeTransferNode(node, pkpInfo, previousOutputs = []) {
  const startTime = Date.now();
  const config = node.config || {};

  // Support both 'recipient' and 'to' field names (AI workflow builder uses 'to')
  const recipient = config.recipient || config.to;
  
  console.log('   [Transfer] Executing token transfer...');
  console.log(`   Chain: ${config.chain || 'Not specified'}`);
  console.log(`   Token: ${config.token || 'Not specified'}`);
  console.log(`   To: ${recipient || 'Not specified'}`);
  console.log(`   Config amount: ${config.amount || 'Not specified'}`);

  // Validate required fields (except amount - we'll try to auto-fill from previous outputs)
  if (!config.chain) {
    throw new Error('Transfer node missing required configuration: chain');
  }
  if (!config.token) {
    throw new Error('Transfer node missing required configuration: token');
  }
  if (!recipient) {
    throw new Error('Transfer node missing required configuration: recipient or to');
  }

  // Determine amount: prefer config.amount but fall back to previous node outputs
  let amount = config.amount;
  if (!amount || amount === '') {
    // Walk previous outputs from latest to oldest and pick the first sensible amount
    // Note: previousOutputs contains the direct result objects from executionContext
    for (let i = previousOutputs.length - 1; i >= 0; i--) {
      const prev = previousOutputs[i];
      if (!prev) continue;
      
      // Check if the result has an output.amountReceived field (swap/aave nodes)
      if (prev.output && prev.output.amountReceived) {
        amount = prev.output.amountReceived;
        console.log(`   [Transfer] Using output.amountReceived from previous node: ${amount}`);
        break;
      }
      
      // Also check for direct amountReceived field (some nodes return it at top level)
      if (prev.amountReceived) {
        amount = prev.amountReceived;
        console.log(`   [Transfer] Using amountReceived from previous node: ${amount}`);
        break;
      }

      // fallback to other numeric fields
      const numeric = extractNumericValue(prev);
      if (numeric && numeric > 0) {
        amount = numeric;
        console.log(`   [Transfer] Using numeric amount extracted from previous node: ${amount}`);
        break;
      }
    }
  }

  if (!amount) {
    throw new Error('Transfer node missing required configuration: amount (no previous output to infer from)');
  }

  // Validate recipient address format
  if (!ethers.utils.isAddress(recipient)) {
    throw new Error(`Invalid recipient address: ${recipient}`);
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
        recipient: recipient,
        amount: amount.toString(),
        userPkpAddress: delegatorPkpEthAddress,
      });
    } else {
      // Transfer ERC20 token
      console.log('   → Transferring ERC20 token...');
      
      // Assume config.token is the token address for ERC20
      transferResult = await transferERC20Token({
        chainName: config.chain,
        tokenAddress: config.token,
        recipient: recipient,
        amount: amount.toString(),
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
      chain: config.chain,
      chainId: getChainId(config.chain),
      txHash: transferResult.txHash,
      recipient: recipient,
      amount: amount,
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

async function executeConditionNode(node, pkpInfo, previousOutputs = [], nodeMap = new Map(), edgeMap = new Map()) {
  const config = node.config || {};
  
  console.log('   [Condition] Evaluating condition...');
  
  // Get incoming edges to find value1 and value2 nodes
  const incomingEdges = Array.from(edgeMap.values()).flat().filter(edge => edge.to === node.id);
  console.log(`   [Condition] Found ${incomingEdges.length} incoming edges`);
  
  // Extract values from side inputs (value1 and value2)
  let value1 = config.leftValue;
  let value2 = config.rightValue;
  
  // Check for value inputs from side nodes
  for (const edge of incomingEdges) {
    const sourceNode = nodeMap.get(edge.from);
    if (!sourceNode) continue;
    
    console.log(`   [Condition] Checking edge from ${sourceNode.type} (handle: ${edge.targetHandle})`);
    
    // Get the output from the source node
    const sourceOutput = previousOutputs.find(output => output.nodeId === sourceNode.id);
    
    if (edge.targetHandle === 'value1' && sourceOutput) {
      // Extract numeric value from source output
      value1 = extractNumericValue(sourceOutput.output);
      console.log(`   [Condition] Value1 from ${sourceNode.type}: ${value1}`);
    } else if (edge.targetHandle === 'value2' && sourceOutput) {
      value2 = extractNumericValue(sourceOutput.output);
      console.log(`   [Condition] Value2 from ${sourceNode.type}: ${value2}`);
    }
  }
  
  const operator = config.operator || '==';
  
  console.log(`   [Condition] Comparing: ${value1} ${operator} ${value2}`);
  
  // Perform comparison
  let conditionMet = false;
  
  try {
    const num1 = parseFloat(value1);
    const num2 = parseFloat(value2);
    
    switch (operator) {
      case '==':
      case '===':
        conditionMet = num1 === num2;
        break;
      case '!=':
      case '!==':
        conditionMet = num1 !== num2;
        break;
      case '>':
        conditionMet = num1 > num2;
        break;
      case '>=':
        conditionMet = num1 >= num2;
        break;
      case '<':
        conditionMet = num1 < num2;
        break;
      case '<=':
        conditionMet = num1 <= num2;
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  } catch (error) {
    throw new Error(`Failed to evaluate condition: ${error.message}`);
  }
  
  console.log(`   [Condition] Result: ${conditionMet ? 'TRUE' : 'FALSE'}`);
  
  return {
    success: true,
    conditionMet,
    value1,
    operator,
    value2,
    message: `Condition ${value1} ${operator} ${value2} is ${conditionMet ? 'TRUE' : 'FALSE'}`,
  };
}

// Helper function to extract numeric values from various output formats
function extractNumericValue(output) {
  if (output === null || output === undefined) {
    return 0;
  }
  
  // If it's already a number
  if (typeof output === 'number') {
    return output;
  }
  
  // If it's a string that can be parsed as a number
  if (typeof output === 'string') {
    const parsed = parseFloat(output);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  // If it's an object, try to extract common numeric fields
  if (typeof output === 'object') {
    // Try common field names for amounts
    const numericFields = ['amount', 'value', 'balance', 'price', 'total', 'count'];
    for (const field of numericFields) {
      if (output[field] !== undefined) {
        const parsed = parseFloat(output[field]);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
    
    // If output has a nested output object
    if (output.output) {
      return extractNumericValue(output.output);
    }
  }
  
  // Default to 0 if we can't extract a number
  return 0;
}

async function executeAINode(node, pkpInfo, previousOutputs = [], nodeMap = new Map(), edgeMap = new Map()) {
  const config = node.config || {};
  
  if (!config.prompt) {
    throw new Error('AI node missing required configuration (prompt)');
  }
  
  console.log('   [AI/ASI:One] Executing AI with prompt:', config.prompt);
  console.log('   [AI/ASI:One] Agent Address:', config.agentAddress || 'None (using AI directly)');
  console.log('   [AI/ASI:One] Previous outputs:', previousOutputs);
  
  try {
    // Prepare context from previous outputs
    let contextInfo = '';
    if (previousOutputs.length > 0) {
      contextInfo = '\n\nContext from previous operations:\n';
      previousOutputs.forEach((output, index) => {
        contextInfo += `Operation ${index + 1}: ${JSON.stringify(output)}\n`;
      });
    }
    
    // Check if agent address is provided for ASI:One delegation
    const hasAgentAddress = config.agentAddress && config.agentAddress.trim().length > 0;
    
    // Build system prompt - include agent address for ASI:One to delegate
    let systemPrompt = config.systemPrompt || 'You are a helpful DeFi assistant that analyzes blockchain data and provides insights.';
    
    if (hasAgentAddress) {
      console.log('   [AI/ASI:One] Using ASI:One delegation to agent:', config.agentAddress);
      
      // Add agent delegation instruction to system prompt
      systemPrompt = `You are delegating this request to an agent with address: ${config.agentAddress}

The agent specializes in blockchain data queries and can provide:
- Token balances and transfers
- Transaction history
- NFT metadata and ownership
- Contract information

Please forward the user's query to this agent and return the response.

${systemPrompt}`;
    } else {
      console.log('   [AI/ASI:One] Using ASI:One AI directly (no agent delegation)...');
    }
    
    const requestBody = {
      model: 'asi1-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: config.prompt + contextInfo
        }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 500
    };
    
    const response = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk_c8d385c761d845689e9aa5dd2ab325024ec3a092ccc44103b6cacacae024b4b7'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`ASI:One API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('   [AI/ASI:One] Response:', aiResponse);
    
    // Determine if agent delegation was used
    const delegatedAgent = hasAgentAddress ? config.agentAddress : null;
    const responseMessage = delegatedAgent 
      ? 'AI analysis completed (delegated to agent)'
      : 'AI analysis completed';
    
    return {
      success: true,
      message: responseMessage,
      prompt: config.prompt,
      response: aiResponse,
      model: 'asi1-mini',
      agentAddress: delegatedAgent,
      delegatedToAgent: !!delegatedAgent,
      output: {
        response: aiResponse,
        agentAddress: delegatedAgent,
        delegatedToAgent: !!delegatedAgent,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('   [AI/ASI:One] Error:', error);
    throw new Error(`AI node execution failed: ${error.message}`);
  }
}

async function executeMCPNode(node, pkpInfo, previousOutputs = []) {
  const config = node.config || {};
  
  if (!config.mcpServer || !config.tool) {
    throw new Error('MCP node missing required configuration (mcpServer, tool)');
  }
  
  console.log('   [MCP] Executing MCP tool:', config.tool, 'on server:', config.mcpServer);
  console.log('   [MCP] Tool parameters:', config.parameters);
  console.log('   [MCP] Previous outputs:', previousOutputs);
  
  // NOTE: MCP nodes should ideally be executed through a uAgent deployed on Agentverse
  // For now, we'll use direct API calls, but for production, deploy as a uAgent:
  // 1. Create an agent with MCP client (see backend-python/agents/mcp_agent.py example)
  // 2. Deploy to Agentverse with mailbox enabled
  // 3. Send messages to the agent address with the tool and parameters
  // 4. Receive results through the agent's response
  
  try {
    // Check if there's an agent address configured for this MCP server
    if (config.agentAddress) {
      return await executeMCPThroughAgent(config, pkpInfo, previousOutputs);
    }
    
    // Fallback to direct execution for testing/development
    console.log('   [MCP] WARNING: Using direct execution. Deploy a uAgent for production use.');
    
    // For Blockscout MCP integration
    if (config.mcpServer === 'blockscout') {
      return await executeBlockscoutMCP(config, pkpInfo, previousOutputs);
    }
    
    // For future MCP servers, we can add more cases here
    throw new Error(`MCP server '${config.mcpServer}' not yet implemented`);
    
  } catch (error) {
    console.error('   [MCP] Error:', error);
    throw new Error(`MCP node execution failed: ${error.message}`);
  }
}

async function executeMCPThroughAgent(config, pkpInfo, previousOutputs) {
  const { agentAddress, tool, parameters = {} } = config;
  
  console.log('   [MCP Agent] Sending request to agent:', agentAddress);
  
  // Prepare the message for the agent
  const message = {
    tool,
    parameters: {
      ...parameters,
      // Auto-fill address if not provided
      address: parameters.address || pkpInfo.ethAddress,
    },
    context: previousOutputs.length > 0 ? previousOutputs : undefined,
  };
  
  try {
    // Send message to the agent via Agentverse
    // This requires the agent to be deployed and listening
    const response = await fetch(`https://agentverse.ai/v1/agents/${agentAddress}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Agentverse API key if needed
      },
      body: JSON.stringify({
        type: 'mcp_request',
        payload: message,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Agent communication failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('   [MCP Agent] Received response:', result);
    
    return {
      success: true,
      message: 'MCP tool executed via agent',
      tool,
      agentAddress,
      data: result,
      output: {
        tool,
        agentAddress,
        result: result.data || result,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('   [MCP Agent] Error:', error);
    throw new Error(`Failed to communicate with MCP agent: ${error.message}`);
  }
}

async function executeBlockscoutMCP(config, pkpInfo, previousOutputs) {
  const { tool, parameters = {} } = config;
  
  console.log('   [Blockscout MCP] Executing tool:', tool);
  
  // Use Blockscout MCP tools
  // Based on https://mcp.blockscout.com/ documentation
  const blockscoutApiUrl = 'https://mcp.blockscout.com/api';
  
  try {
    let result;
    
    switch (tool) {
      case 'get_transactions':
        // Get transaction history for an address
        const address = parameters.address || pkpInfo.ethAddress;
        const chainId = parameters.chainId || '1'; // Default to Ethereum mainnet
        
        result = await fetch(`${blockscoutApiUrl}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            chainId,
            limit: parameters.limit || 10
          })
        });
        break;
        
      case 'get_balance':
        // Get token balances for an address
        const balanceAddress = parameters.address || pkpInfo.ethAddress;
        const balanceChainId = parameters.chainId || '1';
        
        result = await fetch(`${blockscoutApiUrl}/balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: balanceAddress,
            chainId: balanceChainId
          })
        });
        break;
        
      case 'get_token_info':
        // Get information about a token
        if (!parameters.tokenAddress) {
          throw new Error('tokenAddress parameter required for get_token_info');
        }
        
        result = await fetch(`${blockscoutApiUrl}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: parameters.tokenAddress,
            chainId: parameters.chainId || '1'
          })
        });
        break;
        
      default:
        throw new Error(`Unknown Blockscout MCP tool: ${tool}`);
    }
    
    if (!result.ok) {
      throw new Error(`Blockscout API error: ${result.statusText}`);
    }
    
    const data = await result.json();
    
    console.log('   [Blockscout MCP] Result:', data);
    
    // Extract chainId from parameters
    const resultChainId = parameters.chainId || '1';
    
    return {
      success: true,
      message: `Blockscout MCP tool '${tool}' executed successfully`,
      tool,
      chainId: resultChainId,
      data,
      output: {
        tool,
        chainId: resultChainId,
        result: data,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('   [Blockscout MCP] Error:', error);
    throw error;
  }
}
