'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const Customer = require('../model/customer.js');
const Store = require('../model/store.js');
const CartOrder = require('../model/cart-order.js');
const CartProduct = require('../model/cart-product.js');
const InventoryProduct = require('../model/inventory-product.js');

const server = require('../server.js');
const serverToggle = require('./lib/server-toggle.js');

const url = `http://localhost:${process.env.PORT}`;

const sampleInventoryProduct = {
  name: 'Test product',
  desc: 'Test description',
  quantity: 105
};

const sampleCustomer = {
  name: 'Test user',
  username: 'Test username',
  password: 'Testword',
  email: 'test@test.com',
  address: 'Test address'
};

const sampleStore = {
  name: 'Test store',
  storeNumber: '1234',
  address: 'Test store address'
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
  before(done => {
    serverToggle.startServer(server, done);
  });

  after(done => {
    Promise.all([
      Customer.remove({}),
      CartOrder.remove({}),
      CartProduct.remove({}),
      InventoryProduct.remove({}),
      Store.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  after(done => {
    serverToggle.stopServer(server, done);
  });

  describe('POST: /api/orders/:cartOrderID/:storeIDcart', () => {
    before(done => {
      new Store(sampleStore).save()
      .then(store => {
        this.tempStore = store;
        sampleInventoryProduct.storeID = store._id;
        sampleOrder.storeID = store._id;
        return new Customer(sampleCustomer).save();
      })
      .then(customer => {
        this.tempCustomer = customer;
        sampleOrder.customerID = customer._id;
        return Customer.addCartOrder(customer._id, this.tempStore._id, sampleOrder);
      })
      .then(order => {
        this.tempOrder = order;
        sampleProduct.orderID = order._id;
        return Store.addInventoryProduct(this.tempStore._id, sampleInventoryProduct);
      })
      .then(invProduct => {
        this.tempInventoryProduct = invProduct;
        done();
      })
      .catch(done);
    });

    describe('With a valid ID and body', () => {
      it('should return a product', done => {
        request
        .post(`${url}/api/orders/${this.tempOrder._id}/${this.tempStore._id}/cart`)
        .send(sampleProduct)
        .end((err, response) => {
          if (err) return done(err);
          this.tempProduct = response.body;
          InventoryProduct.findById(this.tempInventoryProduct._id)
          .then(product => {
            expect(response.status).to.equal(201);
            expect(response.body.name).to.equal(sampleProduct.name);
            expect(response.body.desc).to.equal(sampleProduct.desc);
            expect(product.quantity).to.equal(5);
            expect(response.body.quantity).to.equal(sampleProduct.quantity);
            expect(response.body.cartOrderID).to.equal(this.tempOrder._id.toString());
            done();
          })
          .catch(done);
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
        .post(`${url}/api/orders/${this.tempOrder._id}/${this.tempStore._id}/cart`)
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

    describe('With no ID', () => {
      it('should return an array of products', done => {
        request
        .get(`${url}/api/products`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('array');
          expect(response.body).to.include(this.tempProduct._id);
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

    describe('With a valid ID, but invalid body', () => {
      it('should return a 400 error', done => {
        request
        .put(`${url}/api/products/${this.tempProduct._id}`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/products/:productID', () => {
    describe('With a valid ID', () => {
      it('should return a 204 status', done => {
        request
        .delete(`${url}/api/products/${this.tempProduct._id}`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(204);
          done();
        });
      });
    });

    describe ('With an invalid ID', () => {
      it('should return a 404 status', done => {
        request
        .delete(`${url}/api/products/69`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('GET: /api/products with no ID, but no data', () => {
    before(done => {
      CartProduct.remove({})
      .then(() => done())
      .catch(done);
    });

    it('should return a 416 error', done => {
      request
      .get(`${url}/api/products`)
      .end((err, response) => {
        expect(err).to.be.an('error');
        expect(response.status).to.equal(416);
        done();
      });
    });
  });
});
