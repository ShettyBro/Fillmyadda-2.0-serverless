
const dbConfig = {
  user: String(process.env.DB_USER),
  password: String(process.env.DB_PASSWORD),
  server: String(process.env.DB_SERVER),
  database: String(process.env.DB_NAME),
  options: {
    encrypt: true,
    enableArithAbort: true
  }
};
