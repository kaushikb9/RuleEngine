var server = require("./app/server");
var rule = require("./app/rule");
var config = require("./config/config");

//  Log unhandled exceptions.
process.on("uncaughtException", function(err) {
  console.error("Unhandled Exception", err);
});
process.on("unhandledRejection", function(err, promise){
  console.error("Unhandled Rejection", err);
});

server.start({
  port: config.port
}).then((app) => {
  console.log("Server started successfully, running on port " + config.port + ".");
});