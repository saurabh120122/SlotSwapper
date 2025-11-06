import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser 
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// --- Public Routes ---
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// --- Secured Routes ---
// This route will first run verifyJWT, then logoutUser
router.route('/logout').post(verifyJWT, logoutUser);

// Test route to see if auth middleware is working
router.route('/me').get(verifyJWT, (req, res) => {
  res.json(new ApiResponse(200, req.user, "User details fetched"));
});

export default router;