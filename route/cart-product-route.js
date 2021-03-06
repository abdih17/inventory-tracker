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

cartRouter.get('/api/products', function(request, response, next) {
  debug('GET: /api/products');

  CartProduct.find({})
  .then(arrayOfProducts => {
    if (arrayOfProducts.length == 0) return Promise.reject(createError(416, 'Data not found.'));
    response.json(arrayOfProducts.map(product => product._id));
  })
  .catch(err => next(err));
});

cartRouter.put('/api/store/:storeID/products/:productID', parseJSON, function(request, response, next) {
  debug('PUT: /api/products/:productID');

  if (Object.getOwnPropertyNames(request.body).length === 0) next(createError(400, 'No body supplied.'));

  CartOrder.updateCartProduct(request.params.productID, request.params.storeID, request.body)
  .then(product => response.json(product))
  .catch(() => next(createError(404, 'Product not found.')));
});

cartRouter.delete('/api/products/:productID', function(request, response, next) {
  debug('DELETE: /api/products/:productID');

  CartOrder.removeCartProduct(request.params.productID)
  .then(() => response.status(204).send())
  .catch(() => next(createError(404, 'Product not found.')));
});
