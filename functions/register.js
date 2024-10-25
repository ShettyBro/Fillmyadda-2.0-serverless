const sql = require('mssql');
const bcrypt = require('bcryptjs');
const dbConfig = require('../dbConfig');
require('dotenv').config();


exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { fullname, email, username, password } = body;

  if (!fullname || !email || !username || !password) {
    return {
      statusCode: 400,
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
      body: JSON.stringify({ message: 'User registered successfully' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error registering user', error: err.message })
    };
  }
};
