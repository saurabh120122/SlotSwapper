import { Router }from 'express';
import userRouter from './user.routes.js';
import eventRouter from './event.routes.js'; // Import the new event router
import swapRouter from './swap.routes.js';
const router = Router();

// --- User Routes ---
// /api/users/register, /api/users/login, ...
router.use('/users', userRouter);

// --- Event Routes ---
// /api/events, /api/events/:eventId, ...
router.use('/events', eventRouter);

// --- Swap Routes (Coming in Part 3) ---
// /api/swappable-slots, /api/swap-request, ...
router.use('/', swapRouter);

export default router;