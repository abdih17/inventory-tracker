'use strict';

const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('inventory:inventory-route');
const Store = require('../model/store.js');
const InventoryOrder = require('../model/inventory-order.js');
const InventoryProduct = require('../model/inventory-product.js');

const inventoryRouter = module.exports = new Router();

inventoryRouter.post('/api/store/:storeID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/store/:storeID/inventory');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  Store.completeInventoryOrder(req.params.storeID, req.body)
  .then( inventory => {
    res.status(201).json(inventory);
  })
  .catch(() => {
    next(createError(404, 'Store not found'));
  });
});

inventoryRouter.post('/api/inventoryOrders/:inventoryOrderID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/inventoryOrders/:inventoryOrderID/inventory');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  InventoryOrder.addInventoryProduct(req.params.inventoryOrderID, req.body)
  .then( inventory => {
    res.status(201).json(inventory);
  })
  .catch(err => next(err));
});

inventoryRouter.get('/api/inventory/:inventoryID', function(req, res, next) {
  debug('GET:/inventory/:inventoryID');

  InventoryProduct.findById(req.params.inventoryID)
  .then( inventory => {
    res.json(inventory);
  })
  .catch( () => next(createError(404, 'Inventory not found')));
});

inventoryRouter.put('/api/inventory/:inventoryID', jsonParser, function(req, res, next) {
  debug('PUT: /api/inventory/:inventoryID');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body supplied.'));

  InventoryProduct.findByIdAndUpdate(req.params.inventoryID, req.body, { new: true })
  .then( inventory => res.status(200).json(inventory))
  .catch( () => next(createError(404, 'Inventory not found')));
});

inventoryRouter.delete('/api/inventory/:inventoryID', function(req, res, next) {
  debug('DELETE: /api/inventory/:inventoryID');

  InventoryOrder.removeInventoryProduct(req.params.inventoryID)
  .then( () => res.status(204).send())
  .catch( () => next(createError(404, 'Inventory not found')));
});
