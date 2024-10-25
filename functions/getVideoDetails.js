const sql = require('mssql');
const dbConfig = require('../dbConfig'); // Ensure dbConfig is defined and correct

async function getMovieDetails(movieId) {
    // Check if movieId is provided
    if (!movieId) {
        throw new Error('Movie ID is required');
    }

    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);
        
        // Query to fetch movie details
        const query = 'SELECT title, source FROM Movies WHERE id = @id';
        const result = await pool.request()
            .input('id', sql.Int, movieId)
            .query(query);

        // Check if any results were returned
        if (result.recordset.length > 0) {
            return result.recordset[0]; // Return the first result
        } else {
            throw new Error('Movie not found');
        }
    } catch (err) {
        console.error('Error fetching movie details:', err);
        throw new Error('Database query error');
    }
}

module.exports = getMovieDetails;