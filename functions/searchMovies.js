// Netlify function: searchMovies.js
const sql = require("mssql");  // Install mssql using npm
const dbConfig = require('../dbConfig');
require('dotenv').config();

console.log('Database Configuration:', {
  user: process.env.DB_USER,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
});


exports.handler = async (event) => {
    const query = event.queryStringParameters.query;
    if (!query) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Query parameter is required" }),
        };
    }

    try {
        // Connect to the SQL database
        await sql.connect(config);
        
        // Query the Movies table for titles that contain the search query
        const result = await sql.query`
            SELECT title FROM movies WHERE title LIKE ${'%' + query + '%'}
        `;

        const movieTitles = result.recordset.map(row => row.title);

        return {
            statusCode: 200,
            body: JSON.stringify({ movies: movieTitles }),
        };
    } catch (error) {
        console.error("Database query error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    } finally {
        await sql.close();
    }
};