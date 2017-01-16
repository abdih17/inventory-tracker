'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const CartOrder = require('../model/cart-order.js');
const Customer = require('../model/customer.js');
const Store = require('../model/store.js');
const InventoryProduct = require('../model/inventory-product.js');
const CartProduct = require('../model/cart-product.js');

const server = require('../server.js');
const serverToggle = require('./lib/server-toggle.js');

const url = `http://localhost:${process.env.PORT}`;

const sampleInventoryProduct = {
  name: 'Test product',
  desc: 'Test description',
  quantity: 105
};

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

const exampleStore = {
  name: 'Test store',
  storeNumber: '1234',
  address: 'Test store address'
};

const exampleOrder = {
  products: []
};

describe('Cart Order Routes', function() {
  before(done => {
    serverToggle.startServer(server, done);
  });

  after(done => {
    Promise.all([
      Store.remove({}),
      Customer.remove({}),
      CartOrder.remove({}),
      InventoryProduct.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  after(done => {
    serverToggle.stopServer(server, done);
  });

  describe('POST: /api/orders/:customerID/:storeID/cart-order', () => {
    before(done => {
      new Customer(exampleCustomer).save()
      .then(customer => {
        this.tempCustomer = customer;
        exampleOrder.customerID = customer._id;
        return new Store(exampleStore).save();
      })
      .then(store => {
        this.tempStore = store;
        exampleOrder.storeID = store._id;
        done();
      })
      .catch(done);
    });

    describe('With a valid customer ID and body', () => {
      it('should return an order', done => {
        request
        .post(`${url}/api/orders/${this.tempCustomer._id}/${this.tempStore._id}/cart-order`)
        .send(exampleOrder)
        .end((err, response) => {
          if (err) return done(err);
          Customer.findById(this.tempCustomer._id)
          .then(customer => {
            this.tempCustomer = customer;
            return Store.findById(this.tempStore._id);
          })
          .then(store => {
            this.tempStore = store;
            this.tempOrder = response.body;
            expect(response.status).to.equal(201);
            expect(response.body.storeID).to.equal(this.tempStore._id.toString());
            expect(response.body.customerID).to.equal(this.tempCustomer._id.toString());
            expect(response.body.shippingAddress).to.equal(this.tempCustomer.address);
            expect(response.body.shippingName).to.equal(this.tempCustomer.name);
            expect(this.tempCustomer.currentOrders.length).to.equal(1);
            expect(this.tempCustomer.currentOrders[0].toString()).to.equal(response.body._id);
            expect(this.tempStore.outgoing.length).to.equal(1);
            expect(this.tempStore.outgoing[0].toString()).to.equal(response.body._id);
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
        .post(`${url}/api/orders/${this.tempCustomer._id}/${this.tempStore._id}/cart-order`)
        .send({})
        .end((err, response) => {
          if(err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.body.storeID).to.equal(this.tempStore._id.toString());
          expect(response.body.customerID).to.equal(this.tempCustomer._id.toString());
          done();
        });
      });
    });
  });

  describe('GET: /api/orders/:orderID', () => {
    before(done => {
      Store.addInventoryProduct(this.tempStore._id, sampleInventoryProduct)
      .then(() => CartOrder.addCartProduct(this.tempOrder._id, this.tempStore._id, exampleProduct))
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

    describe('With no ID', () => {
      it('should return an array of IDs', done => {
        request
        .get(`${url}/api/orders`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('array');
          expect(response.body).to.include(this.tempOrder._id);
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
          CartProduct.findById(this.tempProduct._id).then(product => {
            expect(product).to.equal(null);
            done();
          });
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

  describe('GET: /api/orders with no ID, but no data', () => {
    before(done => {
      CartOrder.remove({})
      .then(() => done())
      .catch(done);
    });

    it('should return a 416 error', done => {
      request
      .get(`${url}/api/orders`)
      .end((err, response) => {
        expect(err).to.be.an('error');
        expect(response.status).to.equal(416);
        done();
      });
    });
  });
});
