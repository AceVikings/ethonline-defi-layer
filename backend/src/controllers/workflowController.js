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
    
    const executions = await ExecutionHistory.find({
      workflowId,
      userId: pkpInfo.ethAddress,
    }).sort({ startedAt: -1 }).limit(50);
    
    res.json({ success: true, executions });
  } catch (error) {
    console.error('Get execution history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
