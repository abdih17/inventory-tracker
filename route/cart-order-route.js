'use strict';

const Router = require('express').Router;
const parseJSON = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('inventory:cart order route');
const CartOrder = require('../model/cart-order.js');
// const Customer = require('../model/customer.js');

const cartOrderRouter = module.exports = Router();

cartOrderRouter.post('/api/cartOrder', parseJSON, function(request, response, next) {
  debug('POST: /api/cartOrder');

  if (Object.getOwnPropertyNames().length === 0) next(createError(400, 'No body posted.'));

  new CartOrder(request.body).save()
  .then(order => response.json(order))
  .catch(next);
});
