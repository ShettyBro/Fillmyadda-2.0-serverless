const sql = require('mssql');
const dbConfig = require('../dbConfig'); // Ensure dbConfig is defined

module.exports.handler = async function (context, req) {
    const { id } = JSON.parse(req.body); // Destructure the ID from the request body

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Movie ID is required' })
        };
    }

    try {
        const pool = await sql.connect(dbConfig); // Connect to the database
        const query = 'SELECT title, source FROM movies WHERE id = @id'; // Use a parameterized query
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        if (result.recordset.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(result.recordset[0]) // Return the first result
            };
        } else {
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
