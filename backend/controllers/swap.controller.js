import { Event } from '../models/event.js';
import { SwapRequest } from '../models/swapRequest.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// 1. Get all slots available for swapping (the "Marketplace")
const getSwappableSlots = asyncHandler(async (req, res) => {
  const events = await Event.find({
    status: 'SWAPPABLE',
    owner: { $ne: req.user._id }, // $ne = Not Equal (don't show my own slots)
  })
    .populate('owner', 'name email') // Show who owns the slot
    .sort({ startTime: 1 });

  return res.status(200).json(
    new ApiResponse(200, events, "Swappable slots fetched successfully")
  );
});

// 2. Create a new swap request (make an offer)
const createSwapRequest = asyncHandler(async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  const requesterId = req.user._id;

  // --- 1. Validation ---
  if (!mongoose.isValidObjectId(mySlotId) || !mongoose.isValidObjectId(theirSlotId)) {
    throw new ApiError(400, "Invalid slot IDs");
  }

  const offeredSlot = await Event.findById(mySlotId);
  const requestedSlot = await Event.findById(theirSlotId);

  // --- 2. The "Checklist" ---
  if (!offeredSlot) throw new ApiError(404, "Your slot was not found");
  if (!requestedSlot) throw new ApiError(404, "The desired slot was not found");

  if (offeredSlot.owner.toString() !== requesterId.toString()) {
    throw new ApiError(403, "You do not own the slot you are offering");
  }
  if (requestedSlot.owner.toString() === requesterId.toString()) {
    throw new ApiError(400, "You cannot swap with yourself");
  }
  if (offeredSlot.status !== 'SWAPPABLE') {
    throw new ApiError(400, "Your slot is not marked as swappable");
  }
  if (requestedSlot.status !== 'SWAPPABLE') {
    throw new ApiError(400, "The desired slot is no longer swappable");
  }

  // --- 3. "Lock" both slots ---
  offeredSlot.status = 'SWAP_PENDING';
  requestedSlot.status = 'SWAP_PENDING';
  
  await offeredSlot.save({ validateBeforeSave: false });
  await requestedSlot.save({ validateBeforeSave: false });

  // --- 4. Create the request ---
  const swapRequest = await SwapRequest.create({
    requester: requesterId,
    receiver: requestedSlot.owner,
    offeredSlot: offeredSlot._id,
    requestedSlot: requestedSlot._id,
    status: 'PENDING',
  });

  return res.status(201).json(
    new ApiResponse(201, swapRequest, "Swap request created successfully")
  );
});

// 3. Respond to an incoming swap request (Accept/Reject)
const respondToSwapRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { accepted } = req.body; // true or false
  const receiverId = req.user._id;

  if (typeof accepted !== 'boolean') {
    throw new ApiError(400, "Invalid response. 'accepted' must be true or false");
  }

  // --- 1. Find the request and validate user ---
  const swapRequest = await SwapRequest.findById(requestId);
  if (!swapRequest) throw new ApiError(404, "Swap request not found");

  if (swapRequest.receiver.toString() !== receiverId.toString()) {
    throw new ApiError(403, "You are not authorized to respond to this request");
  }
  if (swapRequest.status !== 'PENDING') {
    throw new ApiError(400, "This swap request has already been resolved");
  }

  // --- 2. Find the two events ---
  const offeredSlot = await Event.findById(swapRequest.offeredSlot);
  const requestedSlot = await Event.findById(swapRequest.requestedSlot);

  if (!offeredSlot || !requestedSlot) {
    // One of the events was deleted, so we must reject.
    swapRequest.status = 'REJECTED';
    await swapRequest.save({ validateBeforeSave: false });
    // Try to unlock any remaining slot
    if (offeredSlot) {
      offeredSlot.status = 'SWAPPABLE';
      await offeredSlot.save({validateBeforeSave: false});
    }
    if (requestedSlot) {
      requestedSlot.status = 'SWAPPABLE';
      await requestedSlot.save({validateBeforeSave: false});
    }
    throw new ApiError(404, "One of the events no longer exists. Request auto-rejected.");
  }
  
  // --- 3. Process the response ---
  if (accepted) {
    // --- ACCEPTED ---
    // 1. Swap the owners
    const requesterOwner = offeredSlot.owner;
    const receiverOwner = requestedSlot.owner;
    offeredSlot.owner = receiverOwner;
    requestedSlot.owner = requesterOwner;

    // 2. Set status back to BUSY
    offeredSlot.status = 'BUSY';
    requestedSlot.status = 'BUSY';

    // 3. Mark request as accepted
    swapRequest.status = 'ACCEPTED';

    // Save all changes
    await offeredSlot.save({ validateBeforeSave: false });
    await requestedSlot.save({ validateBeforeSave: false });
    await swapRequest.save({ validateBeforeSave: false });

    return res.status(200).json(
      new ApiResponse(200, swapRequest, "Swap accepted!")
    );

  } else {
    // --- REJECTED ---
    // 1. "Unlock" both slots
    offeredSlot.status = 'SWAPPABLE';
    requestedSlot.status = 'SWAPPABLE';

    // 2. Mark request as rejected
    swapRequest.status = 'REJECTED';
    
    // Save all changes
    await offeredSlot.save({ validateBeforeSave: false });
    await requestedSlot.save({ validateBeforeSave: false });
    await swapRequest.save({ validateBeforeSave: false });

    return res.status(200).json(
      new ApiResponse(200, swapRequest, "Swap rejected")
    );
  }
});

// 4. Get all incoming requests for the logged-in user
const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await SwapRequest.find({
    receiver: req.user._id,
    status: 'PENDING',
  })
    .populate('requester', 'name')
    .populate('offeredSlot')
    .populate('requestedSlot');

  return res.status(200).json(
    new ApiResponse(200, requests, "Incoming requests fetched")
  );
});

// 5. Get all outgoing requests from the logged-in user
const getOutgoingRequests = asyncHandler(async (req, res) => {
  const requests = await SwapRequest.find({
    requester: req.user._id,
  })
    .populate('receiver', 'name')
    .populate('offeredSlot')
    .populate('requestedSlot')
    .sort({ createdAt: -1 }); // Show newest first

  return res.status(200).json(
    new ApiResponse(200, requests, "Outgoing requests fetched")
  );
});

export {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getIncomingRequests,
  getOutgoingRequests
};