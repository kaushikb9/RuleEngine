'use strict';
let rule = require("../app/rule");

module.exports = (app, options) => {

  app.post('/decision', (req, res, next) => {
    if(!req.body.checkpoint_id){
      res.status(400).send("checkpoint_id is missing");
    }
    if(!req.body.entity_id){
      res.status(400).send("entity_id is missing");
    }
    rule.decision(req.body).then((evaluation) => {
      res.status(200).send(evaluation);
    },(err) => {
      res.status(err.statusCode).send(err);
    })
    .catch(next);
  });
};