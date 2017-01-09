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
    res.status(201).json(customer.username);
  })
  .catch(next);
});

customerRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  Customer.findOne({ username: req.auth.username })
  .then(customer => customer.validatePassword(req.auth.password))
  .then(() => res.status(200).send('Successful login'))
  .catch(() => next(createError(401, 'Invalid login')));
});
