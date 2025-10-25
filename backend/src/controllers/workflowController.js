import { getPKPInfo } from '@lit-protocol/vincent-app-sdk/jwt';
import Workflow from '../models/Workflow.js';
import ExecutionHistory from '../models/ExecutionHistory.js';

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
    
    const workflow = await Workflow.create({
      userId: pkpInfo.ethAddress,
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      triggers: triggers || { type: 'manual' },
    });
    
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
    
    // Check if workflow is active
    if (!workflow.isActive) {
      return res.status(400).json({ 
        success: false, 
        error: 'Workflow is not active' 
      });
    }
    
    // Create execution history record
    const execution = await ExecutionHistory.create({
      workflowId,
      userId: pkpInfo.ethAddress,
      workflow: workflowId,
      status: 'running',
      startedAt: new Date(),
      steps: [],
    });
    
    // Start async execution (don't wait for it to complete)
    executeWorkflowAsync(workflow, execution, pkpInfo).catch(err => {
      console.error('Workflow execution error:', err);
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
    console.log(`Starting execution for workflow: ${workflow.name} (${workflow._id})`);
    
    // Find the trigger node to start execution
    const triggerNode = workflow.nodes.find(node => node.type === 'trigger');
    if (!triggerNode) {
      throw new Error('No trigger node found in workflow');
    }
    
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
    
    // Execute nodes starting from trigger
    const executionSteps = [];
    await executeNode(triggerNode, nodeMap, edgeMap, executionSteps, pkpInfo);
    
    // Update execution history with success
    await ExecutionHistory.findByIdAndUpdate(execution._id, {
      status: 'completed',
      completedAt: new Date(),
      steps: executionSteps,
    });
    
    console.log(`Workflow execution completed successfully: ${workflow._id}`);
  } catch (error) {
    console.error('Workflow execution failed:', error);
    
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
  console.log(`Executing node: ${node.label || node.type} (${node.id})`);
  
  try {
    let result;
    
    // Execute based on node type
    switch (node.type) {
      case 'trigger':
        result = { success: true, message: 'Workflow triggered manually' };
        break;
        
      case 'swap':
        result = await executeSwapNode(node, pkpInfo);
        break;
        
      case 'aave':
        result = await executeAaveNode(node, pkpInfo);
        break;
        
      case 'transfer':
        result = await executeTransferNode(node, pkpInfo);
        break;
        
      case 'condition':
        result = await executeConditionNode(node, pkpInfo);
        break;
        
      case 'ai':
        result = await executeAINode(node, pkpInfo);
        break;
        
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
    
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
    
    // For condition nodes, follow the appropriate branch
    if (node.type === 'condition' && result.conditionMet !== undefined) {
      const branchEdge = outgoingEdges.find(edge => 
        edge.sourceHandle === (result.conditionMet ? 'true' : 'false')
      );
      if (branchEdge) {
        const nextNode = nodeMap.get(branchEdge.to);
        if (nextNode) {
          await executeNode(nextNode, nodeMap, edgeMap, executionSteps, pkpInfo);
        }
      }
    } else {
      // For other nodes, execute all connected nodes
      for (const edge of outgoingEdges) {
        const nextNode = nodeMap.get(edge.to);
        if (nextNode) {
          await executeNode(nextNode, nodeMap, edgeMap, executionSteps, pkpInfo);
        }
      }
    }
    
  } catch (error) {
    console.error(`Node execution failed: ${node.label || node.type}`, error);
    
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

// Node-specific execution functions (stubs for now)
async function executeSwapNode(node, pkpInfo) {
  // TODO: Implement actual swap logic
  console.log('Executing swap:', node.config);
  return {
    success: true,
    message: 'Swap executed (stub)',
    fromToken: node.config.fromToken,
    toToken: node.config.toToken,
    amount: node.config.amount,
  };
}

async function executeAaveNode(node, pkpInfo) {
  // TODO: Implement actual Aave interaction
  console.log('Executing Aave:', node.config);
  return {
    success: true,
    message: 'Aave action executed (stub)',
    action: node.config.action,
    asset: node.config.asset,
    amount: node.config.amount,
  };
}

async function executeTransferNode(node, pkpInfo) {
  // TODO: Implement actual token transfer
  console.log('Executing transfer:', node.config);
  return {
    success: true,
    message: 'Transfer executed (stub)',
    token: node.config.token,
    recipient: node.config.recipient,
    amount: node.config.amount,
  };
}

async function executeConditionNode(node, pkpInfo) {
  // TODO: Implement actual condition evaluation
  console.log('Executing condition:', node.config);
  
  // Simple stub evaluation - always returns true for now
  const conditionMet = true;
  
  return {
    success: true,
    conditionMet,
    leftValue: node.config.leftValue,
    operator: node.config.operator,
    rightValue: node.config.rightValue,
  };
}

async function executeAINode(node, pkpInfo) {
  // TODO: Implement actual AI agent call
  console.log('Executing AI:', node.config);
  return {
    success: true,
    message: 'AI agent executed (stub)',
    systemPrompt: node.config.systemPrompt,
    userPrompt: node.config.userPrompt,
    response: 'AI response placeholder',
  };
}
