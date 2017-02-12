'use strict';

const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('inventory:inventory-route');
const Store = require('../model/store.js');
const InventoryOrder = require('../model/inventory-order.js');
const InventoryProduct = require('../model/inventory-product.js');

const inventoryRouter = module.exports = new Router();

inventoryRouter.post('/api/inventory-orders/:inventoryOrderID/complete-order', jsonParser, function(req, res, next) {
  debug('POST:/api/inventory-orders/:inventoryOrderID/complete-order');

  Store.completeInventoryOrder(req.params.inventoryOrderID)
  .then(() => res.status(201).send('Items added to warehouse current inventory.'))
  .catch(err => next(err));
});

inventoryRouter.post('/api/store/:storeID/inventory', jsonParser, function(request, response, next) {
  debug('POST: /api/store/:storeID/inventory');

  Store.addInventoryProduct(request.params.storeID, request.body)
  .then(product => response.status(201).json(product))
  .catch(err => next(err));
});

inventoryRouter.post('/api/inventory-orders/:inventoryOrderID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/inventory-orders/:inventoryOrderID/inventory');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  InventoryOrder.addInventoryProduct(req.params.inventoryOrderID, req.body)
  .then( inventory => res.status(201).json(inventory))
  .catch(err => next(err));
});

inventoryRouter.get('/api/inventory/:inventoryID', function(req, res, next) {
  debug('GET:/inventory/:inventoryID');

  InventoryProduct.findById(req.params.inventoryID)
  .then( inventory => res.json(inventory))
  .catch( () => next(createError(404, 'Inventory not found')));
});

inventoryRouter.get('/api/inventory', function(request, response, next) {
  debug('GET: /api/products');

  InventoryProduct.find({})
  .then(arrayOfProducts => {
    if(arrayOfProducts.length == 0) return Promise.reject(createError(416, 'Data not found.'));
    response.json(arrayOfProducts.map(product => product._id));
  })
  .catch(err => next(err));
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
