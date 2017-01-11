'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const basicAuth = require('../lib/basic-auth-middleware.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
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

employeeRouter.put('/api/employee/:employeeID', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT Employee: /api/employee/:employeeID');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  Employee.findByIdAndUpdate(req.params.employeeID, req.body, {new: true})
  .then(employee => {
    if (req.body.password) {
      let password = req.body.password;
      delete req.body.password;
      return employee.hashPassword(password)
      .then(employee => employee.save())
      .then(() => res.status(200).send('Update successful'))
      .catch(() => next(createError(404, 'Employee not found.')));
    }
    res.status(200).send('Update successful');
  })
  .catch(() => next(createError(404, 'Employee not found.')));
});
