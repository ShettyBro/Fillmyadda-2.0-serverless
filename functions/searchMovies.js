// Netlify function: searchMovies.js
const sql = require("mssql"); // Install mssql using npm
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
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all origins
                'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allow methods
                'Content-Type': 'application/json', // Specify content type
            },
            body: JSON.stringify({ error: "Query parameter is required" }),
        };
    }

    try {
        // Connect to the SQL database using the dbConfig
        await sql.connect(dbConfig); // Use dbConfig instead of config
        
        // Query the Movies table for titles that contain the search query
        const result = await sql.query`
            SELECT id, title FROM movies WHERE title LIKE ${'%' + query + '%'}
        `;

        // Map the results to include both id and title
        const movies = result.recordset.map(row => ({
            id: row.id,
            title: row.title
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(movies), // Return the entire movies array
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
