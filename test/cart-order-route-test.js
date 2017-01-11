'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
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

const exampleProduct = {
  name: 'Test product',
  desc: 'Test description',
  quantity: 100
};

const exampleOrder = {
  products: []
};

describe('Cart Order Routes', function() {
  after(done => {
    Promise.all([
      Customer.remove({}),
      CartOrder.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/orders/:customerID/cart-order', () => {
    before(done => {
      new Customer(exampleCustomer).save()
      .then(customer => {
        this.tempCustomer = customer;
        exampleOrder.customerID = customer._id;
        done();
      })
      .catch(done);
    });

    describe('With a valid customer ID and body', () => {
      it('should return an order', done => {
        request
        .post(`${url}/api/orders/${this.tempCustomer._id}/cart-order`)
        .send(exampleOrder)
        .end((err, response) => {
          if (err) return done(err);
          Customer.findById(this.tempCustomer._id)
          .then(customer => {
            this.tempOrder = response.body;
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
        .post(`${url}/api/orders/${this.tempCustomer._id}/cart-order`)
        .send({})
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/orders/:orderID', () => {
    before(done => {
      CartOrder.addCartProduct(this.tempOrder._id, exampleProduct)
      .then(product => {
        this.tempProduct = product;
        done();
      })
      .catch(done);
    });

    describe('With a valid ID', () => {
      it('should return an order', done => {
        request
        .get(`${url}/api/orders/${this.tempOrder._id}`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.products.length).to.equal(1);
          expect(response.body.products[0].name).to.equal(exampleProduct.name);
          expect(response.body.customerID).to.equal(this.tempOrder.customerID);
          expect(response.body.shippingAddress).to.equal(this.tempOrder.shippingAddress);
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 error', done => {
        request
        .get(`${url}/api/orders/69`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('PUT: /api/orders/:orderID', () => {
    describe('With a valid ID and body', () => {
      it('should return an order', done => {
        request
        .put(`${url}/api/orders/${this.tempOrder._id}`)
        .send({shippingAddress: 'new address'})
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.shippingAddress).to.equal('new address');
          expect(response.body.customerID).to.equal(this.tempOrder.customerID);
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 error', done => {
        request
        .put(`${url}/api/orders/69`)
        .send({shippingAddress: 'new address'})
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });

    describe('With a valid ID, but no body', () => {
      it('should return a 400 error', done => {
        request
        .put(`${url}/api/orders/${this.tempOrder._id}`)
        .send({})
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/orders/:orderID', () => {
    describe('With a valid ID', () => {
      it('should return a 204 status', done => {
        request
        .delete(`${url}/api/orders/${this.tempOrder._id}`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(204);
          expect(response.body.shippingAddress).to.equal(undefined);
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 not found error', done => {
        request
        .delete(`${url}/api/orders/69`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });
  });
});
