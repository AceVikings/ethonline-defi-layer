import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  id: String,
  type: String,
  label: String,
  config: mongoose.Schema.Types.Mixed,
  position: {
    x: Number,
    y: Number,
  },
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  id: String,
  from: String,
  to: String,
  sourceHandle: String,
  targetHandle: String,
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  triggers: {
    type: {
      type: String,
      enum: ['manual', 'scheduled', 'event'],
      default: 'manual',
    },
    config: mongoose.Schema.Types.Mixed,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastExecuted: {
    type: Date,
  },
  executionCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Workflow', workflowSchema);
