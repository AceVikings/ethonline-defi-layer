import mongoose from 'mongoose';

const executionStepSchema = new mongoose.Schema({
  nodeId: String,
  nodeType: String,
  nodeLabel: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'skipped'],
  },
  startedAt: Date,
  completedAt: Date,
  output: mongoose.Schema.Types.Mixed,
  error: String,
  txHash: String,
}, { _id: false });

const executionHistorySchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true,
  },
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  steps: [executionStepSchema],
  error: String,
  gasUsed: String,
  costUSD: Number,
}, {
  timestamps: true,
});

export default mongoose.model('ExecutionHistory', executionHistorySchema);
