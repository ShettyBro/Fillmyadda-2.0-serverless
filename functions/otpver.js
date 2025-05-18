const sql = require('mssql');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const dbConfig = require('../dbConfig');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.SECRET_KEY;
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.verifyOTP = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { email, otp } = JSON.parse(event.body);
  if (!email || !otp) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email and OTP are required' }) };
    console.log("Email and OTP are required");
  }

  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`
        SELECT * FROM PasswordResetOTPs 
        WHERE email = @email AND otp = @otp AND expires_at > GETDATE()
      `);

    if (result.recordset.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid or expired OTP' }) };
    }

    // Generate JWT token valid for 10 minutes
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '10m' });

    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ message: 'OTP verified successfully!', token }) 
    };

  } catch (error) {
    console.error('Database error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
  
};

//reset password

exports.resetPassword = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { token, email, newPassword } = JSON.parse(event.body);

  if (!token || !email || !newPassword) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Token, email, and new password are required' }) };
  }

  try {
    // Verify JWT Token
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.email !== email) {
      return { statusCode: 403, headers, body: JSON.stringify({ message: 'Invalid token or email mismatch' }) };
    }

    let pool = await sql.connect(dbConfig);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('hashedPassword', sql.NVarChar, hashedPassword)
      .query(`
        UPDATE Users 
        SET password = @hashedPassword 
        WHERE email = @email
      `);

    // Delete OTP after successful password reset
    await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`DELETE FROM PasswordResetOTPs WHERE email = @email`);

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Password reset successful!' }) };

  } catch (error) {
    console.error('Error resetting password:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};

// netlifi handler export
exports.handler = async (event) => {
    const { action } = event.queryStringParameters || {};
  
    if (action === 'verifyOTP') {
      return exports.verifyOTP(event);
    } else if (action === 'resetPassword') {
      return exports.resetPassword(event);
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
      };
    }
  };
  