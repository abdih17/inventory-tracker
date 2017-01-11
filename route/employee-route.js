'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const basicAuth = require('../lib/basic-auth-middleware.js');
const debug = require('debug')('inventory:employeeRouter');

const Employee = require('../model/employee.js');

const employeeRouter = module.exports = Router();

employeeRouter.post('/api/employee/register', jsonParser, function(req, res, next) {
  debug('POST Employee: /api/employee/register');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  let password = req.body.password;
  delete req.body.password;

  let employee = new Employee(req.body);
  console.log('***THIS IS THE EMPLOYEE***',employee);

  employee.hashPassword(password)
  .then( employee => employee.save())
  .then( employee => employee.generateToken())
  .then( token => {
    console.log('***THIS IS THE TOKEN***', token);
    res.status(201).send(token);
  })
  .catch(next);
});

employeeRouter.get('/api/employee/signin', basicAuth, function(req, res, next) {
  debug('GET Employee: /api/employee/signin');

  Employee.findOne({ username: req.auth.username })
  .then( employee => employee.validatePassword(req.auth.password))
  .then( employee => {
    return res.json({
      name: employee.name,
      username: employee.username,
      email: employee.email,
      admin: employee.admin,
      receiving: employee.receiving,
      shipping: employee.shipping,
    });
  })
  .catch(() => next(createError(401, 'Invalid login')));
});
