'use strict';

// [TODO] - Implement CRUD
module.exports = (app, options) => {

  app.get('/entities', (req, res, next) => {
    options.repository.getEntities().then((entities) => {
      res.status(200).send(entities);
    })
    .catch(next);
  });

  app.get('/entities/:entityId', (req, res, next) => {
    let ids = [req.params.entityId]
    options.repository.getEntities(ids).then((entities) => {
      res.status(200).send(entities);
    })
    .catch(next);
  });

  app.post('/entities', (req, res, next) => {
    options.repository.createEntity(req.body).then((results) => {
      res.status(200).send(results.message);
    })
    .catch(next);
  });
};