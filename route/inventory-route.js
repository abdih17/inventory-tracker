'use strict';

const multer = require('multer');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('inventory:inventory-route');
const Inventory = require('../model/inventory.js');

const inventoryRoute = module.exports = Router();

inventoryRoute.post('/api/store/:storeID/inventory', jsonParser, function(req, res, next) {
  debug('POST:/api/store/:storeID/inventory');

  new Inventory(req.body.storeID).save()
  .then( inventory => res.json(inventory))
  .catch(next);
});

inventoryRoute.post('/api/inventoryOrder', jsonParser, function(req, res, next) {
  debug('POST:/api/store/:storeID/inventory');


});
