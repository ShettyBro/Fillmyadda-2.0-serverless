const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('Missing required environment variable: SECRET_KEY');
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Reset Password Function
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { token, email, newPassword } = JSON.parse(event.body);
  if (!token || !email || !newPassword) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Token, email, and new password are required' }) };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.email !== email) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid token for this email' }) };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const pool = await sql.connect({
      ...dbConfig,
      options: {
        encrypt: true,
        enableArithAbort: true,
        requestTimeout: 9000 // 9 seconds timeout
      }
    });

    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query('UPDATE Users SET password = @password WHERE email = @email');

    if (result.rowsAffected[0] === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ message: 'User not found' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Password updated successfully!' }) };
  } catch (error) {
    console.error('Reset Password Error:', error);
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid or expired token' }) };
  }
};
