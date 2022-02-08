const util = require("util");
const mysql = require("mysql");
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "ecommerce",
// });

// module.exports = {
//   database: db,
// };

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommerce",
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log("Something went wrong connecting to the database");

    if (connection) connection.release();
    return;
  }
});

pool.query = util.promisify(pool.query);

module.exports = pool;
