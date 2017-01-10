'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const CartOrder = require('../model/cart-order.js');
const Promise = require('bluebird');
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
  products: []
};

describe('Cart Order Routes', function() {
  describe('POST: /api/orders/:customerID/cartOrder', () => {
    before(done => {
      new Customer(exampleCustomer).save()
      .then(customer => {
        this.tempCustomer = customer;
        exampleOrder.customerID = customer._id;
        done();
      })
      .catch(done);
    });

    after(done => {
      Promise.all([
        Customer.remove({}),
        CartOrder.remove({})
      ])
      .then(() => done())
      .catch(done);
    });

    describe('With a valid customer ID and body', () => {
      it('should return an order', done => {
        request
        .post(`${url}/api/orders/${this.tempCustomer._id}/cartOrder`)
        .send(exampleOrder)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.customerID).to.equal(this.tempCustomer._id);
          expect(this.tempCustomer.currentOrders.length).to.equal(1);
          expect(response.shippingAddress).to.equal(this.tempCustomer.address);
          expect(response.shippingName).to.equal(this.tempCustomer.name);
          done();
        });
      });
    });
  });
});
