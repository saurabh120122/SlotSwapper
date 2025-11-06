import { Event } from '../models/event.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// --- Create a new event ---
const createEvent = asyncHandler(async (req, res) => {
  const { title, startTime, endTime } = req.body;

  if (!title || !startTime || !endTime) {
    throw new ApiError(400, "All fields (title, startTime, endTime) are required");
  }

  const event = await Event.create({
    title,
    startTime,
    endTime,
    owner: req.user._id, // Set owner from the verified JWT
    status: 'BUSY', // Default status on creation
  });

  if (!event) {
    throw new ApiError(500, "Something went wrong while creating the event");
  }

  return res.status(201).json(
    new ApiResponse(201, event, "Event created successfully")
  );
});

// --- Get all events for the logged-in user ---
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });

  return res.status(200).json(
    new ApiResponse(200, events, "User events fetched successfully")
  );
});

// --- Update an existing event's details ---
const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { title, startTime, endTime } = req.body;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findOne({ _id: eventId, owner: req.user._id });

  if (!event) {
    throw new ApiError(404, "Event not found or you don't have permission");
  }

  // Prevent updates if a swap is pending
  if (event.status === 'SWAP_PENDING') {
    throw new ApiError(400, "Cannot update an event involved in a pending swap");
  }

  // Update fields if they are provided
  if (title) event.title = title;
  if (startTime) event.startTime = startTime;
  if (endTime) event.endTime = endTime;

  await event.save({ validateBeforeSave: true });

  return res.status(200).json(
    new ApiResponse(200, event, "Event updated successfully")
  );
});

// --- Update ONLY the status of an event (e.g., Make Swappable) ---
const updateEventStatus = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  // A user can only manually set status to BUSY or SWAPPABLE
  if (!status || !['BUSY', 'SWAPPABLE'].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be 'BUSY' or 'SWAPPABLE'");
  }

  const event = await Event.findOne({ _id: eventId, owner: req.user._id });

  if (!event) {
    throw new ApiError(404, "Event not found or you don't have permission");
  }

  // Prevent updates if a swap is pending
  if (event.status === 'SWAP_PENDING' && status === 'BUSY') {
    throw new ApiError(400, "Cannot change status of an event in a pending swap");
  }

  event.status = status;
  await event.save({ validateBeforeSave: true });

  return res.status(200).json(
    new ApiResponse(200, event, "Event status updated successfully")
  );
});

// --- Delete an event ---
const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findOne({ _id: eventId, owner: req.user._id });

  if (!event) {
    throw new ApiError(404, "Event not found or you don't have permission");
  }

  // Prevent deletion if a swap is pending
  if (event.status === 'SWAP_PENDING') {
    throw new ApiError(400, "Cannot delete an event involved in a pending swap. Please resolve the swap first.");
  }

  await event.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, { eventId }, "Event deleted successfully")
  );
});


export {
  createEvent,
  getMyEvents,
  updateEvent,
  updateEventStatus,
  deleteEvent
};