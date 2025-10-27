// db.js
const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database_name',
};

async function query(sql, params) {
  const connection = await mysql.createConnection(config);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

module.exports = { query };