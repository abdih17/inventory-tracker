'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('inventory:storeRouter');
const Store = require('../model/store.js');

const storeRouter = module.exports = Router();

// POST NEW STORE --------------
storeRouter.post('/api/store', jsonParser, function(req, res, next) {
  debug('POST: /api/store');

  req.body.timestamp = new Date();
  new Store(req.body).save()
  .then( store => res.json(store))
  .catch(next);
});

// GET A STORE BY ID -------------
storeRouter.get('/api/store/:id', function(req, res, next) {
  debug('GET: /api/store/:id');

  Store.findById(req.params.id)
  .populate('outgoing')
  .populate('incoming')
  .populate('current')
  .then( store => res.json(store))
  .catch( err => next(createError(404, err.message)));
});

// GET A LIST OF ALL STORES ---------------
storeRouter.get('/api/store', function(request, response, next) {
  debug('GET: /api/store');

  Store.find({})
  .then(arrayOfStores => {
    if (arrayOfStores.length === 0) return Promise.reject(createError(416, 'Data not found.'));
    response.json(arrayOfStores.map(store => store._id));
  })
  .catch(err => next(err));
});

// UPDATE STORE INFO BY ID ---------------
storeRouter.put('/api/store/:id', jsonParser, function(req, res, next) {
  debug('PUT: /api/store/:id');

  if(Object.getOwnPropertyNames(req.body).length === 0) {
    return next(createError(400, 'Bad request'));
  }
  Store.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( store => {
    if( store === null) return next(createError(404, 'Not Found'));
    res.json(store);
  })
  .catch( err => {
    if(err.name === 'ValidationError') {
      return next(err);
    }
    next(createError(404, err.message));
  });
});

// DELETE A STORE BY ID ------------------
storeRouter.delete('/api/store/:id', function(req, res, next) {
  debug('DELETE: /api/store/:id');

  Store.findOne({_id: req.params.id})
  .then(store => store.remove())
  .then( () => res.status(204).send())
  .catch( err => next(createError(404, err.message)));
});
