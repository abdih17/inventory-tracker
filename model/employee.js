'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const createError = require('http-errors');
const Promise = require('bluebird');
const debug = require('debug')('inventory:employee');

const Schema = mongoose.Schema;

const employeeSchema = Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  // storeID: { TODO: reference to store, build out later },
  admin: { type: Boolean, required: true },
  shipping: { type: Boolean },
  receiving: { type: Boolean }
});

employeeSchema.pre('save', function(next) {
  if (!this.username) this.username = this.email;
  if (this.admin === true) {
    this.shipping = true;
    this.receiving = true;
  };
  next();
});

employeeSchema.methods.hashPassword = function(password) {
  debug('hashPassword');

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      this.password = hash;
      resolve(this);
    });
  });
};

employeeSchema.methods.validatePassword = function(password) {
  debug('validatePassword');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if (err) return reject(err);
      if (!valid) return reject(createError(401, 'Wrong password'));
      resolve(this);
    });
  });
};

employeeSchema.methods.generateFindHash = function() {
  debug('generateFindHash');

  return new Promise((resolve, reject) => {
    let attempts = 0;

    _generateFindHash.call(this);

    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then( () => resolve(this.findHash))
      .catch( err => {
        if (attempts > 3) return reject(err);
        attempts++;
        _generateFindHash.call(this);
      });
    };
  });
};

employeeSchema.methods.generateToken = function() {
  debug('generateToken');

  return new Promise((resolve, reject) => {
    this.generateFindHash()
    .then( findHash => resolve(jwt.sign({ token: findHash }, process.env.APP_SECRET)))
    .catch( err => reject(err));
  });
};

module.exports = mongoose.module('employee', employeeSchema);
