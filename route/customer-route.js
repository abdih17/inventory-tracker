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

  let password = req.body.password;
  delete req.body.password;

  let customer = new Customer(req.body);
  customer.hashPassword(password)
  .then( customer => customer.save())
  .then( customer => {
    res.status(201).send(customer.username);
  })
  .catch(next);
});
