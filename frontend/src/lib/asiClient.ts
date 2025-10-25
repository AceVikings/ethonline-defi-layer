/**
 * ASI Agent API Client
 * 
 * Client for interacting with AI-powered workflow generation
 * and ASI Alliance features through the Node.js backend
 */

import { apiClient } from './apiClient';

export interface WorkflowGenerationResult {
  success: boolean;
  workflow?: {
    nodes: any[];
    edges: any[];
  };
  explanation?: string;
  strategy?: string;
  intent?: string;
  keyword?: string;
  error?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  workflow?: any;
}

/**
 * Generate a workflow from natural language description
 */
export async function generateWorkflowFromPrompt(
  query: string
): Promise<WorkflowGenerationResult> {
  try {
    const response = await apiClient.generateWorkflowFromPrompt(query);
    return response;
  } catch (error: any) {
    console.error('Error generating workflow:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate workflow',
    };
  }
}

/**
 * Refine an existing workflow based on user feedback
 */
export async function refineWorkflow(
  query: string,
  currentWorkflow: { nodes: any[]; edges: any[] },
  conversationHistory: ConversationMessage[] = []
): Promise<WorkflowGenerationResult> {
  try {
    const response = await apiClient.refineWorkflow(query, currentWorkflow, conversationHistory);
    return response;
  } catch (error: any) {
    console.error('Error refining workflow:', error);
    return {
      success: false,
      error: error.message || 'Failed to refine workflow',
    };
  }
}

/**
 * Search for agents on Agentverse
 */
export async function searchAgents(query: string, semantic: boolean = false) {
  try {
    const response = await apiClient.searchAgents(query, semantic);
    return response;
  } catch (error: any) {
    console.error('Error searching agents:', error);
    return {
      success: false,
      agents: [],
      error: error.message,
    };
  }
}

/**
 * Check if ASI backend is healthy
 */
export async function checkASIHealth() {
  try {
    const response = await apiClient.checkASIHealth();
    return response;
  } catch (error) {
    return {
      success: false,
      python_backend_healthy: false,
    };
  }
}
