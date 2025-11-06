import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
      default: 'BUSY',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Add an index on the owner field for faster querying of a user's events
eventSchema.index({ owner: 1 });

// Add an index for finding swappable slots
eventSchema.index({ status: 1 });

export const Event = mongoose.model('Event', eventSchema);