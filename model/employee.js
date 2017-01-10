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
