'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const CartOrder = require('../model/cart-order.js');
const Customer = require('../model/customer.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleCustomer = {
  name: 'Test user',
  password: 'Testword',
  email: 'test@test.com',
  address: 'Test address',
  username: 'Test username'
};

const exampleOrder = {
  shippingAddress: exampleCustomer.address,
  shippingName: exampleCustomer.name,
};
