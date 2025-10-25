import express from 'express';
import { vincentHandler } from '../config/vincent.js';
import {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getExecutionHistory,
  getExecutionDetails,
  executeWorkflow,
} from '../controllers/workflowController.js';

const router = express.Router();

// Specific routes must come BEFORE parametric routes
router.get('/executions', vincentHandler(getExecutionHistory));
router.get('/executions/:executionId', vincentHandler(getExecutionDetails));
router.get('/', vincentHandler(getWorkflows));
router.post('/', vincentHandler(createWorkflow));
router.get('/:id', vincentHandler(getWorkflow));
router.post('/:id/execute', vincentHandler(executeWorkflow));
router.get('/:workflowId/executions', vincentHandler(getExecutionHistory));
router.put('/:id', vincentHandler(updateWorkflow));
router.patch('/:id', vincentHandler(updateWorkflow));
router.delete('/:id', vincentHandler(deleteWorkflow));

export default router;