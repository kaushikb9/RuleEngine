// index.js
//
//  Entrypoint to the application. Opens a repository to the MySQL
//  server and starts the server.
var server = require('./server/server');
var RuleEngine = require('./rule-engine');
var config = require('./config');

//  Lots of verbose logging when we're starting up...
console.log("--- Customer Service---");
console.log("Connecting to customer repository...");

//  Log unhandled exceptions.
process.on('uncaughtException', function(err) {
  console.error('Unhandled Exception', err);
});
process.on('unhandledRejection', function(err, promise){
  console.error('Unhandled Rejection', err);
});

RuleEngine.connect({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  port: config.db.port
}).then((connection) => {
  console.log("Connected. Starting server...");

  return server.start({
    port: config.port,
    ruleEngine: connection
  });

}).then((app) => {
  console.log("Server started successfully, running on port " + config.port + ".");
  app.on('close', () => {
    repository.disconnect();
  });
});