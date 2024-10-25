const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,           // Important for Azure SQL
    enableArithAbort: true    // Helps prevent connection issues with some SQL setups
  }
};
