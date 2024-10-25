const sql = require('mssql'); // Import the mssql package

// Database configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true // Change to false if using production
    }
};

// Function to connect to the database
async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('Database connection failed: ', err);
        throw err; // Re-throw the error for handling in the calling function
    }
}

// Export the sql object and the connect function
module.exports = { sql, connectToDatabase };
