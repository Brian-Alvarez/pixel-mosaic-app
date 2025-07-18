import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER!,
  options: {
    encrypt: true,            // if using Azure or secure connection
    trustServerCertificate: true, // for local dev, usually needed
  },
};

export const pool = new sql.ConnectionPool(config);
export const poolConnect = pool.connect();
export default sql;
