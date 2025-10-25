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
    await executeNode(triggerNode, nodeMap, edgeMap, executionSteps, pkpInfo);
    
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
async function executeNode(node, nodeMap, edgeMap, executionSteps, pkpInfo) {
  const stepStartTime = new Date();
  console.log(`\n┌─ Executing Node: ${node.label || node.type}`);
  console.log(`│  ID: ${node.id}`);
  console.log(`│  Type: ${node.type}`);
  console.log(`│  Config:`, JSON.stringify(node.config || {}, null, 2).split('\n').map((line, i) => i === 0 ? line : `│  ${line}`).join('\n'));
  
  try {
    let result;
    
    // Execute based on node type
    switch (node.type) {
      case 'trigger':
        result = { success: true, message: 'Workflow triggered manually' };
        console.log(`│  ✓ Trigger executed`);
        break;
        
      case 'swap':
        result = await executeSwapNode(node, pkpInfo);
        console.log(`│  ✓ Swap executed:`, result);
        break;
        
      case 'aave':
        result = await executeAaveNode(node, pkpInfo);
        console.log(`│  ✓ Aave executed:`, result);
        break;
        
      case 'transfer':
        result = await executeTransferNode(node, pkpInfo);
        console.log(`│  ✓ Transfer executed:`, result);
        break;
        
      case 'condition':
        result = await executeConditionNode(node, pkpInfo);
        console.log(`│  ✓ Condition evaluated:`, result);
        break;
        
      case 'ai':
        result = await executeAINode(node, pkpInfo);
        console.log(`│  ✓ AI executed:`, result);
        break;
        
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
    
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
          await executeNode(nextNode, nodeMap, edgeMap, executionSteps, pkpInfo);
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
          await executeNode(nextNode, nodeMap, edgeMap, executionSteps, pkpInfo);
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
    
    // Convert slippage percentage to basis points (1% = 100 basis points)
    const slippageBps = Math.round((parseFloat(config.slippage) || 0.5) * 100);
    
    console.log(`   → Step 1: Generating signed Uniswap quote...`);
    
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
    console.log(`   → Step 2: Checking ERC20 approval...`);
    
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
    
    console.log(`   → Step 3: Executing Uniswap swap...`);
    
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
    
    return {
      success: true,
      message: 'Swap executed successfully via Uniswap V3',
      chain: config.chain,
      fromToken: config.fromToken,
      toToken: config.toToken,
      amountIn: config.amount,
      expectedAmountOut: signedUniswapQuote.quote.amountOut,
      slippage: config.slippage || 0.5,
      approvalTxHash,
      swapTxHash,
      uniswapRouter: uniswapRouterAddress,
    };
  } catch (error) {
    console.error(`   ✗ Swap failed:`, error.message);
    throw new Error(`Swap execution failed: ${error.message}`);
  }
}

async function executeAaveNode(node, pkpInfo) {
  // TODO: Implement actual Aave interaction
  const config = node.config || {};
  
  if (!config.action || !config.asset || !config.amount) {
    throw new Error('Aave node missing required configuration (action, asset, amount)');
  }
  
  console.log('   [Aave] Executing Aave:', config);
  
  return {
    success: true,
    message: 'Aave action executed (stub)',
    action: config.action,
    asset: config.asset,
    amount: config.amount,
    useAsCollateral: config.useAsCollateral || false,
  };
}

async function executeTransferNode(node, pkpInfo) {
  // TODO: Implement actual token transfer
  const config = node.config || {};
  
  if (!config.token || !config.recipient || !config.amount) {
    throw new Error('Transfer node missing required configuration (token, recipient, amount)');
  }
  
  console.log('   [Transfer] Executing transfer:', config);
  
  return {
    success: true,
    message: 'Transfer executed (stub)',
    token: config.token,
    recipient: config.recipient,
    amount: config.amount,
  };
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
