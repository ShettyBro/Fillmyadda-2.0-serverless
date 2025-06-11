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
        const { seriesId, seasonNumber } = JSON.parse(event.body);

        if (!seriesId || !seasonNumber) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'seriesId and seasonNumber are required' })
            };
        }

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('seriesId', sql.Int, seriesId)
            .input('seasonNumber', sql.Int, seasonNumber)
            .query(`
                SELECT E.id AS episodeId, E.title, E.description, E.duration, 
                       E.thumbnail, E.source, E.episode_number
                FROM Episodes E
                INNER JOIN Seasons S ON E.season_id = S.id
                WHERE S.series_id = @seriesId AND S.season_number = @seasonNumber
                ORDER BY E.episode_number ASC
            `);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.recordset)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error', details: err.message })
        };
    }
};