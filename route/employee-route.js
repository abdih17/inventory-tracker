'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('inventory:employeeRouter');
const basicAuth = require('../lib/basic-auth-middleware.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Store = require('../model/store.js');
const Employee = require('../model/employee.js');

const employeeRouter = module.exports = Router();

employeeRouter.post('/api/store/:storeID/employee', jsonParser, function(req, res, next) {
  debug('POST Employee: /api/store/:storeID/employee');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  let password = req.body.password;
  delete req.body.password;

  let employee = new Employee(req.body);

  let tempEmployee = {};

  employee.hashPassword(password)
  .then( employee => Store.findByIdAndAddEmployee(req.params.storeID, employee))
  .then( employee => {
    tempEmployee = employee;
    return employee.generateToken();
  })
  .then( token => {
    res.status(201).json({
      _id: tempEmployee._id,
      name: tempEmployee.name,
      username: tempEmployee.username,
      email: tempEmployee.email,
      admin: tempEmployee.admin,
      receiving: tempEmployee.receiving,
      shipping: tempEmployee.shipping,
      token
    });
  })
  .catch(next);
});

employeeRouter.get('/api/employee/signin', basicAuth, function(req, res, next) {
  debug('GET Employee: /api/employee/signin');

  Employee.findOne({ username: req.auth.username })
  .then( employee => employee.validatePassword(req.auth.password))
  .then( employee => {
    return res.json({
      _id: employee._id,
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

employeeRouter.get('/api/employee', function(request, response, next) {
  debug('GET: /api/employee');

  Employee.find({})
  .then(arrayOfEmployees => {
    if (arrayOfEmployees.length === 0) return Promise.reject(createError(416, 'Data not found.'));
    response.json(arrayOfEmployees.map(employee => employee._id));
  })
  .catch(err => next(err));
});

employeeRouter.put('/api/employee/:employeeID', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT Employee: /api/employee/:employeeID');

  if (Object.getOwnPropertyNames(req.body).length === 0) next(createError(400, 'No body included.'));

  Employee.findById(req.params.employeeID)
  .then( employee => {
    // do not allow a non-admin employee to update privileges
    if (employee.admin === false) {
      if (req.body.admin || req.body.receiving || req.body.shipping) {
        return next(createError(403, 'Forbidden'));
      }
    }
    employee.update(req.body);

    // re-hash password if employee is changing password
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

employeeRouter.delete('/api/employee/:employeeID', bearerAuth, jsonParser, function(req, res, next) {
  debug('DELETE Employee: /api/employee/:employeeID');

  Employee.findByIdAndRemove(req.params.employeeID)
  .then( employee => {
    if (employee.admin === false ) return next(createError(403, 'Forbidden'));
    res.status(204).send('Employee deleted.');
  })
  .catch(() => next(createError(404, 'Employee not found')));
});
