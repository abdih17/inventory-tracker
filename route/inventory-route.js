'use strict';

const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('inventory:inventory-route');
const InventoryOrder = require('../model/inventory-order.js');
const InventoryProduct = require('../model/inventory.js');

const inventoryRouter = module.exports = new Router();

inventoryRouter.post('/api/store/:storeID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/store/:storeID/inventory');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  InventoryOrder.addInventoryProduct(req.params.inventoryOrderID, req.body)
  .then( inventory => {
    res.status(201).json(inventory);
  })
  .catch( () => next(createError(404, 'Inventory order not found')));
});

inventoryRouter.post('/api/inventoryOrders/:inventoryOrderID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/inventoryOrders/:inventoryOrderID/inventory');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  InventoryOrder.addInventoryProduct(req.params.inventoryOrderID, req.body)
  .then( inventory => {
    res.status(201).json(inventory);
  })
  .catch( () => next(createError(404, 'Inventory order not found')));
});

inventoryRouter.get('/api/inventory/:inventoryID', function(req, res, next) {
  debug('GET:/inventory/:inventoryID');

  InventoryProduct.findById(req.params.id)
  .then( inventory => res.json(inventory))
  .catch( () => next(createError(404, 'Inventory not found')));
});

inventoryRouter.put('/api/inventories/:inventoryProductID', jsonParser, function(req, res, next) {
  debug('PUT: /api/inventory/:inventoryID');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body supplied.'));

  InventoryProduct.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( inventory => res.status(201).json(inventory))
  .catch( () => next(createError(404, 'Inventory not found')));
});

inventoryRouter.delete('/api/inventories/:inventoryProductID', function(req, res, next) {
  debug('DELETE: /api/inventory/:inventoryID');

  InventoryProduct.removeInventoryProduct(req.params.id)
  .then( () => res.status(204).send())
  .catch( () => next(createError(404, 'Inventory not found')));
});
