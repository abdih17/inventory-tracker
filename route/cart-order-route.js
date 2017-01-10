'use strict';

const Router = require('express').Router;
const parseJSON = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('inventory:cart order route');
const CartOrder = require('../model/cart-order.js');
const Customer = require('../model/customer.js');

const cartOrderRouter = module.exports = Router();

cartOrderRouter.post('/api/orders/:customerID/cartOrder', parseJSON, function(request, response, next) {
  debug('POST: /api/cartOrder');

  if (Object.getOwnPropertyNames(request.body).length === 0) next(createError(400, 'No body posted.'));

  Customer.addCartOrder(request.params.customerID, request.body)
  .then(order => response.status(201).json(order))
  .catch(err => next(createError(404, err.message)));
});

cartOrderRouter.get('/api/orders/:orderID', function(request, response, next) {
  debug('GET: /api/orders/:orderID');

  CartOrder.findById(request.params.orderID)
  .then(order => response.json(order))
  .catch(() => next(createError(404, 'Not found.')));
});
