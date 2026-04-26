const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../model/user');
const AuthToken = require('../model/authToken');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth.js')

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const user = new User({
      userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isPro: false
    });

    await user.save();

    // Generate auth token
    const tokenValue = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

    const authToken = new AuthToken({
      tokenId: uuidv4(),
      userId,
      tokenValue,
      expiryDate
    });

    await authToken.save();

    // Return user data (without password) and token
    res.status(201).json({
      message: 'User registered successfully',
      token: tokenValue,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate new auth token
    const tokenValue = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

    // Delete old tokens for this user (optional - you might want to keep multiple devices logged in)
    // await AuthToken.deleteMany({ userId: user.userId });

    const authToken = new AuthToken({
      tokenId: uuidv4(),
      userId: user.userId,
      tokenValue,
      expiryDate
    });

    await authToken.save();

    // Return user data (without password) and token
    res.json({
      message: 'Login successful',
      token: tokenValue,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get profile endpoint 
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const authToken = await AuthToken.findOne({ tokenValue: token });
    if (!authToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if token is expired
    if (new Date() > authToken.expiryDate) {
      await AuthToken.deleteOne({ tokenId: authToken.tokenId });
      return res.status(401).json({ message: 'Token expired' });
    }

    // Get user
    const user = await User.findOne({ userId: authToken.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isPro: user.isPro,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update profile endpoint (requires authentication middleware)
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const authToken = await AuthToken.findOne({ tokenValue: token });
    if (!authToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if token is expired
    if (new Date() > authToken.expiryDate) {
      await AuthToken.deleteOne({ tokenId: authToken.tokenId });
      return res.status(401).json({ message: 'Token expired' });
    }

    // Get user
    const user = await User.findOne({ userId: authToken.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user data
    const { password, subscriptionPlan } = req.body;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (subscriptionPlan) {
      user.subscriptionPlan = subscriptionPlan;
      user.isPro = subscriptionPlan === 'pro';
    }

    if (typeof isPro === 'boolean') {
      user.isPro = isPro;
    }

    user.updatedAt = new Date();
    await user.save();

    // Return updated user data
    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const authToken = await AuthToken.findOne({ tokenValue: token });
    if (!authToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if token is expired
    if (new Date() > authToken.expiryDate) {
      await AuthToken.deleteOne({ tokenId: authToken.tokenId });
      return res.status(401).json({ message: 'Token expired' });
    }

    // Get user data
    const user = await User.findOne({ userId: authToken.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isPro: user.isPro,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error verifying token' });
  }
});

module.exports = router;

