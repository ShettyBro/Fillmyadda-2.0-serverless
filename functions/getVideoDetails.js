const sql = require('mssql');
const dbConfig = require('../dbConfig');
const { verifyToken } = require('./verifyToken');
require('dotenv').config();


exports.handler = async (event) => {
  try {
    // Verify token before proceeding
    const user = verifyToken(event);

    const body = JSON.parse(event.body);
    const { id } = body;

    if (!id) {
      return {
        statusCode: 400,
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
        body: JSON.stringify(result.recordset[0])
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Movie not found' })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Error fetching video details' })
    };
  }
};
