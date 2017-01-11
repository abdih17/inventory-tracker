'use strict';

const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('inventory:inventory-route');
const Inventory = require('../model/inventory.js');

const inventoryRouter = module.exports = Router();

inventoryRouter.post('/api/store/:storeID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/store/:storeID/inventory');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  new Inventory(req.body).save()
  .then( inventory => {
    res.status(201).json(inventory);
  })
  .catch(err => next(createError(400, err.message)));
});

inventoryRouter.post('/api/inventoryOrder/:inventoryOrderID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/inventoryOrder');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  new Inventory(req.body).save()
  .then( inventory => res.status(201).json(inventory))
  .catch( err => next(createError(400, err.message)));
});

inventoryRouter.get('/api/inventory/:id', function(req, res, next) {
  debug('GET:/inventory/:id');

  Inventory.findById(req.params.id)
  .then( inventory => res.json(inventory))
  .catch(err => next(createError(404, err.message)));
});

inventoryRouter.put('/api/inventory/:id', jsonParser, function(req, res, next) {
  debug('PUT: /api/inventory');

  Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( inventory => res.status(201).json(inventory))
  .catch(err => next(createError(401, err.message)));
});

inventoryRouter.delete('/api/inventory/:id', function(req, res, next) {
  debug('DELETE: /api/inventory');

  Inventory.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch( err => next(createError(404, err.message)));
});
