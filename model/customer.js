'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const debug = require('debug')('inventory:customer');
const Promise = require('bluebird');
const Schema = mongoose.Schema;


const customerSchema = Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
    // TODO: stretch goal- set up default username to email
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  currentOrders: [
    {
      type: Schema.Types.ObjectId
    }
  ],
  pastOrders: [
    {
      type: String
    }
  ]
});


customerSchema.methods.hashPassword = function(password) {
  debug('hashPassword');

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if(err) return reject(err);
      this.password = hash;
      return resolve(this);
    });
  });
};

customerSchema.methods.validatePassword = function(password) {
  debug('validatePassword');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(createError(401, 'Wrong password'));
      return resolve(this);
    });
  });
};

module.exports = mongoose.model('customer', customerSchema);
