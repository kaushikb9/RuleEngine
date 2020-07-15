'use strict';
var mysql = require('mysql');
var config = require('../config/config');

module.exports.execute = function(query){
  var connection = mysql.createConnection({
    host     : config.db.host,
    user     : config.db.user,
    password : config.db.password,
    database : config.db.database,
    port     : config.db.port
  });

  connection.connect();

  return new Promise((resolve, reject) => {
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      console.log('The solution is: ', results);
      resolve(results)
    });

  })
    
  connection.end();  
}

// CRUD for entities
getEntities(ids) {
  let modelName = "entity"
  return new Promise((resolve, reject) => {
    let queryString = `SELECT id, name, identifier FROM ${modelName}`
    if(ids && ids.length > 0){
      ids = ids.join()
      queryString = `${queryString} WHERE id IN (${ids})`
    }
    console.log(queryString)
    this.connection.query(queryString, (err, results) => {
      if(err) {
        return reject(new Error("An error occured getting data from entity table: " + err));
      }
      resolve((results || []).map((entity) => {
        return {
          id: entity.id,
          name: entity.name,
          identifier: entity.identifier
        };
      }));
    });
  });
}

createEntity(body) {
  let modelName = "entity"
  return new Promise((resolve, reject) => {
    let queryString = `INSERT INTO ${modelName}(name, identifier, created_on, updated_on) VALUES("${body.name}", "${body.identifier}", now(), now())`
    console.log(queryString)
    this.connection.query(queryString, (err, results) => {
      if(err) {
        return reject(new Error("An error occured creating data in entity table: " + err));
      }
      resolve({message: `Entity created with ID = ${results.insertId}`});
    });
  });
}