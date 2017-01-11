'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('inventory:inventory-order-route');
const InventoryOrder = require('../model/inventory-order.js');
const Store = require('../model/customer.js');

const inventoryOrderRouter = module.exports = Router();

inventoryOrderRouter.post('/api/store/:storeID/inventory-order', jsonParser, function(req, res, next) {
  debug('POST: /api/store/:storeID/inventory-order');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body posted.'));

  Store.addInventoryOrder(req.params.customerID, req.body)
  .then(order => res.status(201).json(order))
  .catch(err => next(createError(404, err.message)));
});

inventoryOrderRouter.get('/api/inventories/:inventoryOrderID', function(req, res, next) {
  debug('GET: /api/inventories/:inventoryOrderID');

  InventoryOrder.findById(req.params.inventoryOrderID)
  .populate('inventoryProduct')
  .then(order => res.json(order))
  .catch(() => next(createError(404, 'Not found.')));
});

inventoryOrderRouter.put('/api/inventories/:inventoryOrderID', jsonParser, function(req, res, next) {
  debug('PUT: /api/inventories/:inventoryOrderID');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body posted.'));

  InventoryOrder.findByIdAndUpdate(req.params.inventoryOrderID, req.body, {new: true})
  .then(order => res.json(order))
  .catch(() => next(createError(404, 'Not found.')));
});

inventoryOrderRouter.delete('/api/inventories/:inventoryOrderID', function(req, res, next) {
  debug('DELETE: /api/inventories/:inventoryOrderID');

  Store.removeInventoryOrder(req.params.inventoryOrderID)
  .then(() => res.status(204).send())
  .catch(() => next(createError(404, 'Not found.')));
});
