import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema(
  {
    // User who is making the offer
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // User who owns the desired slot
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The event the requester is offering
    offeredSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    // The event the requester wants
    requestedSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);