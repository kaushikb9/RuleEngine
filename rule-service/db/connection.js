let mysql = require("mysql");
let config = require("../config/config");

let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : config.db.host,
  user            : config.db.user,
  password        : config.db.password,
  database        : config.db.database,
  port            : config.db.port
});

module.exports.query = (queryString)=>{
  return new Promise((resolve, reject) => {
    pool.query(queryString, function (error, results, fields) {
      if (error) throw error;
      resolve(results)
    })
  })
}