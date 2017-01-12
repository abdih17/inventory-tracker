'use strict';

const Router = require('express').Router;
const parseJSON = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('student:assignment route');
const CartOrder = require('../model/cart-order.js');
const CartProduct = require('../model/cart-product.js');
const cartRouter = module.exports = new Router();

cartRouter.post('/api/orders/:cartOrderID/:storeID/cart', parseJSON, function(request, response, next) {
  debug('POST: /api/orders/:cartOrderID/cart');

  if (Object.getOwnPropertyNames(request.body).length === 0) next(createError(400, 'No body supplied.'));

  CartOrder.addCartProduct(request.params.cartOrderID, request.params.storeID, request.body)
  .then(product => response.status(201).json(product))
  .catch(err => next(err));
});

cartRouter.get('/api/products/:productID', function(request, response, next) {
  debug('GET: /api/products/:productID');

  CartProduct.findById(request.params.productID)
  .then(product => response.json(product))
  .catch(() => next(createError(404, 'Product not found.')));
});

cartRouter.put('/api/products/:productID', parseJSON, function(request, response, next) {
  debug('PUT: /api/products/:productID');

  if (Object.getOwnPropertyNames(request.body).length === 0) next(createError(400, 'No body supplied.'));

  CartProduct.findByIdAndUpdate(request.params.productID, request.body, {new: true})
  .then(product => response.json(product))
  .catch(() => next(createError(404, 'Product not found.')));
});

cartRouter.delete('/api/products/:productID', function(request, response, next) {
  debug('DELETE: /api/products/:productID');

  CartOrder.removeCartProduct(request.params.productID)
  .then(() => response.status(204).send())
  .catch(() => next(createError(404, 'Product not found.')));
});
