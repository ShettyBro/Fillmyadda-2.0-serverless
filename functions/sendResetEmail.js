const sql = require('mssql');
const crypto = require('crypto');
const fetch = require('node-fetch');
const dbConfig = require('../dbConfig');
require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Forgot Password with OTP
exports.forgotPassword = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email is required' }) };
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

  try {
    // Store OTP in the database
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .input('expiresAt', sql.DateTime, expiresAt)
      .query(`
        INSERT INTO PasswordResetOTPs (email, otp, expires_at) 
        VALUES (@email, @otp, @expiresAt)
      `);

    // Send OTP via email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'no-reply@sudeepbro.me',
        to: email,
        subject: 'Your Password Reset OTP',
        html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
      })
    });

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'OTP sent!' }) };

  } catch (error) {
    console.error('Database error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};
