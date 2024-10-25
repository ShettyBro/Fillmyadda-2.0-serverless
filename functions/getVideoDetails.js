const sql = require('mssql');
const dbConfig = require('../dbConfig'); // Ensure dbConfig is defined and correct

module.exports.handler = async function (context, req) {
    let movieId;
    
    // Safely parse req.body and log for debugging
    try {
        const parsedBody = JSON.parse(req.body);
        movieId = parsedBody.id;
        console.log('Received movie ID:', movieId);
    } catch (error) {
        console.error('Error parsing request body:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request format' })
        };
    }

    // Check if movie ID exists
    if (!movieId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Movie ID is required' })
        };
    }

    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);
        const query = 'SELECT title, source FROM Movies WHERE id = @id'; // Check your table name
        const result = await pool.request()
            .input('id', sql.Int, movieId)
            .query(query);

        // Return movie details if found
        if (result.recordset.length > 0) {
            console.log('Movie details found:', result.recordset[0]);
            return {
                statusCode: 200,
                body: JSON.stringify(result.recordset[0])
            };
        } else {
            console.log('Movie not found for ID:', movieId);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Movie not found' })
            };
        }
    } catch (err) {
        console.error('Error fetching video details:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database query error' })
        };
    }
};
