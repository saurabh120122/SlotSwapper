import dotenv from 'dotenv';
import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import the main "router-of-routers"
import mainRouter from './routes/index.js';
import { ApiError } from './utils/ApiError.js';

// --- 1. Initial Setup ---

// Load environment variables from .env file
dotenv.config({
  path: './.env',
});

const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. Database Connection ---
connectDB()
  .then(() => {
    // --- 5. Start Server ---
    // Start listening only after the DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed! Server not started.", err);
    process.exit(1);
  });

// --- 3. Global Middleware ---

// Configure CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Your React app's URL
  credentials: true, // Allow cookies to be sent
}));

// Body Parsers
app.use(express.json({ limit: "16kb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded bodies

// Serve static files (e.g., 'public' folder for images)
app.use(express.static("public"));

// Cookie Parser
app.use(cookieParser());

// --- 4. API Routes ---

// Mount the main API router
// All routes from routes/index.js will be prefixed with /api
app.use('/api', mainRouter);

// --- 6. Global Error Handling Middleware ---
// This will catch all errors passed by asyncHandler
app.use((err, req, res, next) => {
  // If the error is one of our custom ApiErrors, use its properties
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  // For all other unexpected errors
  console.error("Unhandled Error:", err.stack); // Log the full error stack
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [err.message],
  });
});