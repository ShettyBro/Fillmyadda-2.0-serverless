const sql = require('mssql');
const dbConfig = require('../dbConfig'); // Ensure dbConfig is defined

module.exports = async function (context, req) {
  const movieId = req.body.id;

  if (!movieId) {
      context.res = {
          status: 400,
          body: { message: 'Movie ID is required.' }
      };
      return;
  }

  try {
      // Connect to the database
      await sql.connect(dbConfig); // Use dbConfig instead of config
      
      // Query to get video details
      const result = await sql.query`SELECT title, source FROM movies WHERE id = ${movieId}`;

      if (result.recordset.length === 0) {
          context.res = {
              status: 404,
              body: { message: 'Movie not found.' }
          };
      } else {
          context.res = {
              status: 200,
              body: result.recordset[0] // Return the first result
          };
      }
  } catch (err) {
      console.error('Database query error:', err);
      context.res = {
          status: 500,
          body: { message: 'An error occurred while fetching video details.' }
      };
  } finally {
      await sql.close(); // Close the connection
  }
};
