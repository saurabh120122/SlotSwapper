import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: String, 
    } 
  },
  { timestamps: true }
);

// --- Mongoose Middleware to hash password BEFORE saving ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Mongoose method to compare passwords ---
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// --- Mongoose method to generate JWT Access Token ---
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d', // Or '15m'
    }
  );
};

// --- Mongoose method to generate JWT Refresh Token ---
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, // Use a separate secret in production!
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d',
    }
  );
};

export const User = mongoose.model('User', userSchema);