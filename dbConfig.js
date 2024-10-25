const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,           // Important for Azure SQL
    enableArithAbort: true,    // Helps prevent connection issues with some SQL setups
    connectionTimeout: 30000   // Set to 30 seconds
  }
};
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => console.log('Database connection failed: ', err));