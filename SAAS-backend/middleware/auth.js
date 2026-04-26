const AuthToken = require('../model/authToken');
const User = require('../model/user');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
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

    // Attach user to request
    req.user = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      isPro: user.isPro
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = authenticate;

