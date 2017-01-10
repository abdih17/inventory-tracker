'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const debug = require('debug')('inventory:customer');
const Promise = require('bluebird');
const CartOrder = require('./cart-order.js');
const Schema = mongoose.Schema;


const customerSchema = Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
    // TODO: stretch goal- set up default username to email
  },
  email: {
    type: String,
    required: true,
    unique: true
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

const Customer = module.exports = mongoose.model('customer', customerSchema);

Customer.addCartOrder = function(id, order) {
  debug('addCartOrder');

  return Customer.findById(id)
  .then(customer => {
    if (!order.shippingAddress) order.shippingAddress = customer.address;
    if (!order.shippingName) order.shippingName = customer.name;

    order.customerID = customer._id;
    this.tempCustomer = customer;
    return new CartOrder(order).save();
  })
  .then(order => {
    this.tempCustomer.currentOrders.push(order._id);
    this.tempOrder = order;
    return this.tempCustomer.save();
  })
  .then(() => this.tempOrder)
  .catch(err => Promise.reject(createError(404, err.message)));
};

Customer.removeCartOrder = function(id) {
  debug('removeCartOrder');

  return CartOrder.findById(id)
  .then(order => {
    this.tempOrder = order;
    return CartOrder.findByIdAndRemove(order._id);
  })
  .then(() => Customer.findById(this.tempOrder.customerID))
  .then(customer => {
    customer.currentOrders.splice(customer.currentOrders.indexOf(this.tempOrder._id), 1);
    customer.save();
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};
