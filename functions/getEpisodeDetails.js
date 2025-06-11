// ✅ Netlify Function: getEpisodeDetails.js
const sql = require('mssql');
const dbConfig = require('../dbConfig');

exports.handler = async function (event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { episodeId } = JSON.parse(event.body);
        if (!episodeId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Episode ID is required' })
            };
        }

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, episodeId)
            .query('SELECT title, source FROM Episodes WHERE id = @id');

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
                body: JSON.stringify({ error: 'Episode not found' })
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error', details: err.message })
        };
    }
};




