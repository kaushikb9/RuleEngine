'use strict';

//  Only export - adds the API to the app with the given options.
module.exports = (app, options) => {

  app.post('/decision', (req, res, next) => {
    if(!req.body.checkpoint_id){
      res.status(400).send("checkpoint_id is missing");
    }
    if(!req.body.entity_id){
      res.status(400).send("entity_id is missing");
    }
    options.ruleEngine.checkDecision(req.body).then((evaluation) => {
      res.status(200).send(evaluation);
    })
    .catch(next);
  });
};