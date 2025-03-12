const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const crypto = require('crypto');
const dbConfig = require('../dbConfig');
require('dotenv').config();

// Generate a secure secret key
const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('Missing required environment variable: SECRET_KEY');
}


const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Forgot Password Function
exports.forgotPassword = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email is required' }) };
  }

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '30m' });
  const resetLink = `https://filmyadda.sudeepbro.me/reset.html?token=${token}`;
  

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'no-reply@sudeepbro.me',
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href='${resetLink}'>here</a> to reset your password. This link is valid for 30 minutes.</p>`
    })
  });

  return { statusCode: 200, headers, body: JSON.stringify({ message: 'Reset link sent!' }) };
};

// Reset Password Function
exports.resetPassword = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { token, newPassword } = JSON.parse(event.body);
  if (!token || !newPassword) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Token and new password are required' }) };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query('UPDATE Users SET password = @password WHERE email = @email');

    if (result.rowsAffected[0] === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ message: 'User not found' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Password updated successfully!' }) };
  } catch (error) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid or expired token' }) };
  }
};

// Netlify Handler Export
exports.handler = async (event) => {
  const { action } = event.queryStringParameters || {};
  
  if (action === 'forgotPassword') {
    return exports.forgotPassword(event);
  } else if (action === 'resetPassword') {
    return exports.resetPassword(event);
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Not Found' })
    };
  }
};

