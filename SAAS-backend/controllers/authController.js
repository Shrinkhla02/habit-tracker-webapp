const bcrypt = require('bcrypt');
const User = require('../model/user');

/**
 * GET /api/auth/profile
 * Returns logged-in user's profile (no password)
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ userId }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isPro: user.isPro,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

/**
 * PUT /api/auth/profile
 * Update password and/or subscription plan
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { password, subscriptionPlan } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isPro: user.isPro,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};