import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  pkpEthAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  pkpPublicKey: {
    type: String,
    required: true,
  },
  pkpTokenId: {
    type: String,
    required: true,
  },
  authenticationMethod: {
    type: String,
    enum: ['email', 'phone', 'passkey'],
  },
  authenticationValue: {
    type: String,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
