const sql = require('mssql');
const bcrypt = require('bcryptjs');
const dbConfig = require('../dbConfig');
require('dotenv').config();

console.log('Database Configuration:', {
  user: process.env.DB_USER,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
});


exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  const body = JSON.parse(event.body);
  const { fullname, email, username, password } = body;

  if (!fullname || !email || !username || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'All fields are required' })
    };
  }

  try {
    const pool = await sql.connect(dbConfig);

    const existingUser = await pool.request()
      .input('username', sql.VarChar, username)
      .input('fullname', sql.VarChar, fullname)
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE username = @username OR fullname = @fullname OR email = @email');

    if (existingUser.recordset.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ message: 'Username, fullname, or email already exists.' })
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, hashedPassword)
      .input('fullname', sql.VarChar, fullname)
      .input('email', sql.VarChar, email)
      .query('INSERT INTO Users (username, password, fullname, email) VALUES (@username, @password, @fullname, @email)');

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: 'User registered successfully' })
    };
  }
    catch (err) {
      console.error("Database connection error:", err); // Log to Netlify
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ message: 'Database error', error: err.message })
      };
    }
  }
;


