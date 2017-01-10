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

  if (Object.getOwnPropertyNames().length === 0) next(createError(400, 'No body posted.'));

  Customer.findById(request.params.customerID)
  .then(customer => {
    if (!request.body.shippingAddress) request.body.shippingAddress = customer.address;
    if (!request.body.shippingName) request.body.shippingName = customer.name;

    this.tempCustomer = customer;
    return new CartOrder(request.body).save();
  })
  .then(order => {
    this.tempOrder = order;
    this.tempCustomer.currentOrders.push(order._id);
    return this.tempCustomer.save();
  })
  .then(() => response.status(201).json(this.tempOrder))
  .catch(next);
});
