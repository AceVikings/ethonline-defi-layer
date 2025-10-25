/**
 * ASI Agent Routes
 * 
 * Endpoints for AI-powered workflow generation and agent interaction
 */

import express from 'express';
import {
  generateWorkflowFromNL,
  queryKnowledgeGraph,
  searchAgents,
  checkPythonBackendHealth,
} from '../utils/asiAgents.js';
import { authenticateToken } from '../controllers/authController.js';

const router = express.Router();/**
 * POST /api/asi/workflow/generate
 * Generate a workflow from natural language description
 */
router.post('/workflow/generate', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    console.log(`🤖 [ASI] Generating workflow for user: ${req.user.email}`);
    console.log(`   Query: "${query}"`);

    const result = await generateWorkflowFromNL(query, req.user.ethAddress);

    console.log(`✅ [ASI] Workflow generated successfully`);
    console.log(`   Strategy: ${result.strategy || 'custom'}`);
    console.log(`   Intent: ${result.intent}`);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('❌ [ASI] Error generating workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate workflow',
      error: error.message,
    });
  }
});

/**
 * POST /api/asi/knowledge/query
 * Query the MeTTa knowledge graph
 */
router.post('/knowledge/query', authenticateToken, async (req, res) => {
  try {
    const { type, query } = req.body;
    
    if (!type || !query) {
      return res.status(400).json({
        success: false,
        message: 'Both type and query are required',
      });
    }

    console.log(`📚 [ASI] Querying knowledge graph: ${type}(${query})`);

    const result = await queryKnowledgeGraph(type, query);

    console.log(`✅ [ASI] Query successful, results: ${result.length}`);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('❌ [ASI] Error querying knowledge graph:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query knowledge graph',
      error: error.message,
    });
  }
});

/**
 * POST /api/asi/workflow/refine
 * Refine an existing workflow based on user feedback
 */
router.post('/workflow/refine', authenticateToken, async (req, res) => {
  try {
    const { query, currentWorkflow, conversationHistory = [] } = req.body;
    
    if (!query || !currentWorkflow) {
      return res.status(400).json({
        success: false,
        message: 'Query and current workflow are required',
      });
    }

    console.log(`🔄 [ASI] Refining workflow for user: ${req.user.email}`);
    console.log(`   Feedback: "${query}"`);

    const result = await generateWorkflowFromNL(query, req.user.ethAddress, {
      currentWorkflow,
      conversationHistory,
    });

    console.log(`✅ [ASI] Workflow refined successfully`);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('❌ [ASI] Error refining workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refine workflow',
      error: error.message,
    });
  }
});

/**
 * POST /api/asi/agents/search
 * Search for agents on Agentverse
 */
router.post('/agents/search', authenticateToken, async (req, res) => {
  try {
    const { query, semantic = false } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    console.log(`🔍 [ASI] Searching for agents: "${query}" (semantic: ${semantic})`);

    const agents = await searchAgents(query, semantic);

    console.log(`✅ [ASI] Found ${agents.length} agents`);

    res.json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error('❌ [ASI] Error searching agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search agents',
      error: error.message,
    });
  }
});

/**
 * GET /api/asi/health
 * Check if ASI Python backend is healthy
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await checkPythonBackendHealth();

    res.json({
      success: true,
      python_backend_healthy: isHealthy,
      message: isHealthy ? 'Python backend is responsive' : 'Python backend is not responding',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check health',
      error: error.message,
    });
  }
});

export default router;
