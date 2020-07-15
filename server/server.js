//  server.js

const express = require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

module.exports.start = (options) => {

  return new Promise((resolve, reject) => {

    //  Make sure we have a ruleEngine connection and port provided.
    if(!options.ruleEngine) throw new Error("A server must be started with a connected repository.");
    if(!options.port) throw new Error("A server must be started with a port.");

    //  Create the app, add some logging.
    let app = express();

    let swagger_options = {
      swaggerOptions: {
        validatorUrl: null
      } 
    };
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, swagger_options));

    

    //  Add the APIs to the app.
    require('../api/entity')(app, options);
    require('../api/decision')(app, options);

    //  Start the app, creating a running server which we return.
    let server = app.listen(options.port, () => {
      resolve(server);
    });

  });
};