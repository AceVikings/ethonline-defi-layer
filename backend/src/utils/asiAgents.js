/**
 * ASI Agent Integration Module
 * 
 * Provides integration with the Python backend for ASI Alliance features:
 * - AI-powered workflow generation using MeTTa knowledge graphs
 * - Natural language to workflow translation via ASI:One
 * - Agent discovery and interaction via uAgents
 */

import fetch from 'node-fetch';

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8080';

// Log the backend URL on module load (v1.1 - port 8000 update)
console.log(`[ASI Module v1.1] Loaded - Python Backend URL: ${PYTHON_BACKEND_URL}`);

/**
 * Generate a workflow from natural language description
 * @param {string} query - User's natural language workflow description
 * @param {string} userAddress - User's Ethereum address
 * @param {Object} options - Additional options (currentWorkflow, conversationHistory)
 * @returns {Promise<Object>} - Generated workflow with nodes and edges
 */
async function generateWorkflowFromNL(query, userAddress = '', options = {}) {
  try {
    console.log(`[ASI Module v1.1] Calling Python backend at: ${PYTHON_BACKEND_URL}/api/workflow/generate`);
    console.log(`[ASI Module v1.1] Query: "${query}"`);
    
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/workflow/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        userAddress,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate workflow');
    }

    return {
      workflow: data.workflow,
      explanation: data.explanation,
      strategy: data.strategy,
      intent: data.intent,
      keyword: data.keyword,
    };
  } catch (error) {
    console.error('Error calling Python backend:', error);
    throw error;
  }
}

/**
 * Query the MeTTa knowledge graph
 * @param {string} type - Query type (capability, strategy, protocol, solution, consideration)
 * @param {string} query - Query parameter
 * @returns {Promise<Array>} - Query results
 */
async function queryKnowledgeGraph(type, query) {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/knowledge/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        query,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to query knowledge graph');
    }

    return data.result;
  } catch (error) {
    console.error('Error querying knowledge graph:', error);
    throw error;
  }
}

/**
 * Search for agents on Agentverse
 * @param {string} query - Search query
 * @param {boolean} semantic - Use semantic search
 * @returns {Promise<Array>} - List of matching agents
 */
async function searchAgents(query, semantic = false) {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/agents/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        semantic,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to search agents');
    }

    return data.agents;
  } catch (error) {
    console.error('Error searching agents:', error);
    throw error;
  }
}

/**
 * Check if Python backend is healthy
 * @returns {Promise<boolean>} - True if backend is responsive
 */
async function checkPythonBackendHealth() {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Python backend health check failed:', error);
    return false;
  }
}

export {
  generateWorkflowFromNL,
  queryKnowledgeGraph,
  searchAgents,
  checkPythonBackendHealth,
};
