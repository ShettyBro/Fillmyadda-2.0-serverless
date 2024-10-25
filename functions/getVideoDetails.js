const sql = require('mssql');
const dbConfig = require('../dbConfig');

// Export the handler function for Netlify
exports.handler = async function(event, context) {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers
        };
    }

    // Ensure the request is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse the request body
        const { id } = JSON.parse(event.body);

        // Check if id is provided
        if (!id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Movie ID is required' })
            };
        }

        // Connect to the database
        const pool = await sql.connect(dbConfig);
        
        // Query to fetch movie details
        const query = 'SELECT title, source FROM Movies WHERE id = @id';
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        // Check if any results were returned
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
        console.error('Error fetching movie details:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database query error' })
        };
    }
};