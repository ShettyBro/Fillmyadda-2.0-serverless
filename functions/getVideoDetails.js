const sql = require('mssql');
const dbConfig = require('../dbConfig');
const { verifyToken } = require('./verifyToken');
require('dotenv').config();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Verify token before proceeding
    const user = verifyToken(event);

    const body = JSON.parse(event.body);
    const { id } = body;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Movie ID is required' })
      };
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT title, source FROM movies WHERE id = @id');

    if (result.recordset.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.recordset[0])
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Movie not found' })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Error fetching video details' })
    };
  }
};
