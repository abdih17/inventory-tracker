'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const Customer = require('../model/customer.js');
const CartOrder = require('../model/cart-order.js');
const CartProduct = require('../model/cart.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const sampleCustomer = {
  name: 'Test user',
  username: 'Test username',
  password: 'Testword',
  email: 'test@test.com',
  address: 'Test address'
};

const sampleOrder = {
  products: []
};

const sampleProduct = {
  name: 'Test product',
  desc: 'Test description',
  quantity: 100
};

describe('Cart Product Routes', function() {
  after(done => {
    Promise.all([
      Customer.remove({}),
      CartOrder.remove({}),
      CartProduct.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/orders/:cartOrderID/cart', () => {
    before(done => {
      new Customer(sampleCustomer).save()
      .then(customer => {
        this.tempCustomer = customer;
        sampleOrder.customerID = customer._id;
        return Customer.addCartOrder(customer._id, sampleOrder);
      })
      .then(order => {
        this.tempOrder = order;
        sampleProduct.orderID = order._id;
        done();
      })
      .catch(done);
    });

    describe('With a valid ID and body', () => {
      it('should return a product', done => {
        request
        .post(`${url}/api/orders/${this.tempOrder._id}/cart`)
        .send(sampleProduct)
        .end((err, response) => {
          if (err) return done(err);
          this.tempProduct = response.body;
          expect(response.status).to.equal(201);
          expect(response.body.name).to.equal(sampleProduct.name);
          expect(response.body.desc).to.equal(sampleProduct.desc);
          expect(response.body.quantity).to.equal(sampleProduct.quantity);
          expect(response.body.cartOrderID).to.equal(this.tempOrder._id.toString());
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 status', done => {
        request
        .post(`${url}/api/orders/69`)
        .send(sampleProduct)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });

    describe('With a valid ID, but invalid body', () => {
      it('should return a 400 status', done => {
        request
        .post(`${url}/api/orders/${this.tempOrder._id}/cart`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/products/:productID', () => {
    describe('With a valid ID', () => {
      it('should return a product', done => {
        request
        .get(`${url}/api/products/${this.tempProduct._id}`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal(this.tempProduct.name);
          expect(response.body.desc).to.equal(this.tempProduct.desc);
          expect(response.body.quantity).to.equal(this.tempProduct.quantity);
          expect(response.body.cartOrderID).to.equal(this.tempOrder._id.toString());
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 error', done => {
        request
        .get(`${url}/api/products/69`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('PUT: /api/products/:productID', () => {
    describe('With a valid ID and body', () => {
      it('should return an updated product', done => {
        request
        .put(`${url}/api/products/${this.tempProduct._id}`)
        .send({name: 'New name'})
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal('New name');
          expect(response.body.desc).to.equal(this.tempProduct.desc);
          expect(response.body.quantity).to.equal(this.tempProduct.quantity);
          expect(response.body.cartOrderID).to.equal(this.tempProduct.cartOrderID.toString());
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 error', done => {
        request
        .put(`${url}/api/products/69`)
        .send({name: 'New name'})
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });
  });
});
