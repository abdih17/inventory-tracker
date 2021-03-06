'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('inventory:customerRouter');
const basicAuth = require('../lib/basic-auth-middleware.js');
const Customer = require('../model/customer.js');

const customerRouter = module.exports = Router();

customerRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  let password = req.body.password;
  delete req.body.password;

  let customer = new Customer(req.body);
  customer.hashPassword(password)
  .then( customer => customer.save())
  .then( customer => {
    return res.status(201).json({
      _id: customer._id,
      name: customer.name,
      address: customer.address,
      email: customer.email,
      username: customer.username,
      currentOrders: customer.currentOrders,
      favoriteStore: customer.favoriteStore});
  })
  .catch(next);
});

customerRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  Customer.findOne({ username: req.auth.username })
  .populate('currentOrders')
  .then(customer => customer.validatePassword(req.auth.password))
  .then(customer => {
    return res.json({
      _id: customer._id,
      name: customer.name,
      address: customer.address,
      email: customer.email,
      username: customer.username,
      currentOrders: customer.currentOrders,
      favoriteStore: customer.favoriteStore});
  })
  .catch(() => next(createError(401, 'Invalid login')));
});

customerRouter.put('/api/customer/:customerID', basicAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/customer/:customerID');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  Customer.findByIdAndUpdate(req.params.customerID, req.body, {new: true})
  .then(customer => {
    if (req.body.password) {
      let password = req.body.password;
      delete req.body.password;
      return customer.hashPassword(password)
      .then(customer => customer.save())
      .then(() => res.status(200).send('Update successful'))
      .catch(() => next(createError(404, 'Customer not found.')));
    }
    res.status(200).send('Update successful');
  })
  .catch(() => next(createError(404, 'Customer not found.')));
});

customerRouter.delete('/api/customer/:customerID', basicAuth, function(request, response, next) {
  debug('DELETE: /api/customer/:customerID');

  Customer.findByIdAndRemove(request.params.customerID)
  .then(() => response.status(204).send('Customer deleted.'))
  .catch(() => next(createError(404)));
});
