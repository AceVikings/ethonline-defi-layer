import mongoose from 'mongoose';

const nodeResultSchema = new mongoose.Schema({
  nodeId: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'skipped'],
  },
  output: mongoose.Schema.Types.Mixed,
  txHash: String,
  error: String,
}, { _id: false });

const executionHistorySchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  nodeResults: [nodeResultSchema],
  errors: [String],
  gasUsed: String,
  costUSD: Number,
}, {
  timestamps: true,
});

export default mongoose.model('ExecutionHistory', executionHistorySchema);
