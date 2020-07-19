const express = require("express");
const bodyParser = require("body-parser");

module.exports.start = (options) => {

  return new Promise((resolve, reject) => {

    if(!options.port) throw new Error("A server must be started with a port.");

    let app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    //  Add the APIs to the app.
    require("../api/decision")(app, options);

    //  Start the app, creating a running server which we return.
    let server = app.listen(options.port, () => {
      resolve(server);
    });
  });
};