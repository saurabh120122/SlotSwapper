import { Router } from 'express';
import {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getIncomingRequests,
  getOutgoingRequests
} from '../controllers/swap.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// --- Apply JWT verification to all swap routes ---
router.use(verifyJWT);

// --- Define the routes ---

// GET /api/swappable-slots
router.route('/swappable-slots').get(getSwappableSlots);

// POST /api/swap-request
router.route('/swap-request').post(createSwapRequest);

// POST /api/swap-response/:requestId
router.route('/swap-response/:requestId').post(respondToSwapRequest);

// GET /api/swap-requests/incoming
router.route('/swap-requests/incoming').get(getIncomingRequests);

// GET /api/swap-requests/outgoing
router.route('/swap-requests/outgoing').get(getOutgoingRequests);

export default router;