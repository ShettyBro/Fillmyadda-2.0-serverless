const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();


// Generate a secure secret key
const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

// Replace with a secure secret key
const JWT_SECRET = generateSecretKey();



exports.verifyToken = (event) => {
  const token = event.headers.authorization?.split(' ')[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    throw new Error('Access Denied: No Token Provided');
  }

  try {
    // Verify token and return decoded user info
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid Token');
  }
};
