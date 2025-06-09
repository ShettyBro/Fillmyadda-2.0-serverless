const sql = require('mssql');
const fetch = require('node-fetch');
const crypto = require('crypto');
const dbConfig = require('../dbConfig');
require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};


// send otp
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
      html: `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
  <!-- LOGO PLACEHOLDER -->
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://drive.google.com/file/d/1IGUcJpeEk-yIhxOasiwAXrtFBXhy3m_2/view?usp=sharing" alt="Logo" style="max-width: 150px; height: auto;">
  </div>

  <!-- Email Content -->
  <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
  <p style="font-size: 16px; color: #555;">Hello,</p>
  <p style="font-size: 16px; color: #555;">
    Your OTP for password reset is 
    <strong style="font-size: 20px; color: #000;">${otp}</strong>.
  </p>
  <p style="font-size: 14px; color: #777;">
    This code is valid for 10 minutes. Please do not share it with anyone.
  </p>

  <!-- Footer -->
  <hr style="margin: 30px 0;">
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    If you did not request a password reset, please ignore this email.
  </p>
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    &copy; 2025 SudeepBro.me
  </p>
</div>`
    })
  });
 
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OTP sent successfully!',
      otp,
      expiresAt
    })
  };
  
} catch (error) {
  console.error('Database error:', error);
  return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal Server Error' }) };
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

