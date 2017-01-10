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
          Customer.findById(this.tempCustomer._id)
          .then(customer => {
            this.tempCustomer = customer;
            expect(response.status).to.equal(201);
            expect(response.body.customerID).to.equal(this.tempCustomer._id.toString());
            expect(response.body.shippingAddress).to.equal(this.tempCustomer.address);
            expect(response.body.shippingName).to.equal(this.tempCustomer.name);
            expect(this.tempCustomer.currentOrders.length).to.equal(1);
            expect(this.tempCustomer.currentOrders[0].toString()).to.equal(response.body._id);
            done();
          })
          .catch(done);
        });
      });
    });

    describe('With an invalid customer ID', () => {
      it('should return a 404 status', done => {
        request
        .post(`${url}/api/orders/69`)
        .send(exampleOrder)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });

    describe('With a valid ID, but no body', () => {
      it('should return a 400 status', done => {
        request
        .post(`${url}/api/orders/${this.tempCustomer._id}/cartOrder`)
        .send({})
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });
});
