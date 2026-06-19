import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { z } from 'zod';

// -------------------- VALIDATION --------------------
const registerSchema = z.object({
  fullname: z.string().min(2).max(50),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// -------------------- TOKEN --------------------
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// -------------------- REGISTER --------------------
export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // check existing user
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { username: validatedData.username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === validatedData.email
            ? 'Email already registered'
            : 'Username already taken'
      });
    }

    // safe user creation
    const userData = {
      fullname: validatedData.fullname,
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      avatar: req.file ? `/uploads/${req.file.filename}` : ""
    };

    const user = await User.create(userData);

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || "",
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        totalHives: user.totalHives || 0
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR 🔥:", error);

    // Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors
      });
    }

    // Mongo / JWT / unexpected errors
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email })
      .select('+password');

    if (!user || !(await user.comparePassword(validatedData.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || "",
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        totalHives: user.totalHives || 0
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR 🔥:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// -------------------- CURRENT USER --------------------
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers', 'fullname username avatar')
      .populate('following', 'fullname username avatar');

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// -------------------- LOGOUT --------------------
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};