const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const express = require('express'); 
require('dotenv').config();


// Generate a secure secret key
const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

// Replace with a secure secret key
const JWT_SECRET = generateSecretKey();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { username, password } = body;

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Username and password are required' })
    };
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid username or password' })
      };
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Generate JWT token with 5-hour expiry
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '5h' }
      );

      // Return token to client
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Login successful', token })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid username or password' })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error during login', error: err.message })
    };
  }
};
