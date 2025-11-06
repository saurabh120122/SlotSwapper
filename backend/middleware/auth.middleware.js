import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get token from either cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // 2. Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user in DB (and ensure password/refreshToken haven't changed)
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // This covers cases where user is deleted, token is invalid, etc.
      throw new ApiError(401, "Invalid Access Token");
    }

    // 4. Attach user object to the request
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid Access Token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access Token has expired');
    }
    // Forward other errors
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export { verifyJWT };