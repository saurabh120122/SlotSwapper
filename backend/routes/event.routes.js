import { Router } from 'express';
import {
  createEvent,
  getMyEvents,
  updateEvent,
  updateEventStatus,
  deleteEvent
} from '../controllers/event.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// --- Apply JWT verification to all event routes ---
// A user must be logged in to do anything with events
router.use(verifyJWT);

// --- Define the routes ---

// POST /api/events
// GET /api/events
router.route('/')
  .post(createEvent)
  .get(getMyEvents);

// PUT /api/events/:eventId
// DELETE /api/events/:eventId
router.route('/:eventId')
  .put(updateEvent)
  .delete(deleteEvent);

// PATCH /api/events/:eventId/status
// (Using PATCH is conventional for partial updates like status)
router.route('/:eventId/status')
  .patch(updateEventStatus);

export default router;