import express from 'express';
import { vincentHandler } from '../config/vincent.js';
import {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getExecutionHistory,
} from '../controllers/workflowController.js';

const router = express.Router();

router.get('/', vincentHandler(getWorkflows));
router.get('/:id', vincentHandler(getWorkflow));
router.post('/', vincentHandler(createWorkflow));
router.put('/:id', vincentHandler(updateWorkflow));
router.delete('/:id', vincentHandler(deleteWorkflow));
router.get('/:workflowId/executions', vincentHandler(getExecutionHistory));

export default router;