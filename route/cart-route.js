'use strict';

const Router = require('express').Router;
const parseJSON = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('student:assignment route');
const CartOrder = require('../model/cart-order.js');
// const CartProduct = require('../model/cart.js');
const cartRouter = module.exports = new Router();

cartRouter.post('/api/orders/:cartOrderID/cart', parseJSON, function(request, response, next) {
  debug('POST: /api/orders/:cartOrderID/cart');

  if (Object.getOwnPropertyNames(request.body).length === 0) next(createError(400, 'No body supplied.'));

  CartOrder.addCartProduct(request.params.cartOrderID, request.body)
  .then(product => response.status(201).json(product))
  .catch(() => next(createError(404, 'Cart order not found.')));
});
