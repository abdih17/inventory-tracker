'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const InventoryOrder = require('../model/inventory-order.js');
const InventoryProduct = require('../model/inventory-product.js');
const Store = require('../model/store.js');

const server = require('../server.js');
const serverToggle = require('./lib/server-toggle.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleStore = {
  name: 'Test user',
  storeNumber: '1234',
  address: 'Test address'
};

const exampleInventoryProduct = {
  name: 'Test name',
  desc: 'Test description',
  quantity: 12
};

const exampleInventoryOrder = {
  inventories: []
};

describe('Inventory Order Routes', function() {
  before(done => {
    serverToggle.startServer(server, done);
  });

  after(done => {
    Promise.all([
      Store.remove({}),
      InventoryProduct.remove({}),
      InventoryOrder.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  after(done => {
    serverToggle.stopServer(server, done);
  });

  describe('POST: /api/inventories/:storeID/inventory-order', () => {
    before(done => {
      new Store(exampleStore).save()
      .then(store => {
        this.tempStore = store;
        exampleInventoryOrder.storeID = store._id;
        done();
      })
      .catch(done);
    });

    describe('with a valid store ID and body', () => {
      it('should return an order', done => {
        request
        .post(`${url}/api/store/${this.tempStore._id}/inventory-order`)
        .send(exampleInventoryOrder)
        .end((err, res) => {
          if (err) return done(err);
          Store.findById(this.tempStore._id)
          .then(store => {
            this.tempInventoryOrder = res.body;
            expect(res.status).to.equal(201);
            expect(res.body.storeID).to.equal(store._id.toString());
            expect(store.incoming.length).to.equal(1);
            expect(store.incoming[0].toString()).to.equal(res.body._id);
            done();
          })
          .catch(done);
        });
      });
    });

    describe('with an invalid store ID', () => {
      it('should return a 404 status', done => {
        request
        .post(`${url}/api/store/1234/inventory-order`)
        .send(exampleInventoryOrder)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });

    describe('with a valid ID, but no body', () => {
      it('should return an order', done => {
        request
        .post(`${url}/api/store/${this.tempStore._id}/inventory-order`)
        .send({})
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body.storeID).to.equal(this.tempStore._id.toString());
          done();
        });
      });
    });

    describe('with an empty body', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/store/${this.tempStore._id}/inventory`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });
    });
  });

  describe('GET: /api/inventories/:inventoryOrderID', () => {
    before(done => {
      InventoryOrder.addInventoryProduct(this.tempInventoryOrder._id, exampleInventoryProduct)
      .then(product => {
        this.tempInventoryProduct = product;
        done();
      })
      .catch(done);
    });

    describe('with a valid ID', () => {
      it('should return an order', done => {
        request
        .get(`${url}/api/inventories/${this.tempInventoryOrder._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.inventories.length).to.equal(1);
          expect(res.body.storeID).to.equal(this.tempInventoryOrder.storeID);
          done();
        });
      });
    });

    describe('with an invalid ID', () => {
      it('should return a 404 error', done => {
        request
        .get(`${url}/api/inventories/invent`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('PUT: /api/inventories/:inventoryOrderID', () => {
    describe('with a valid ID and body', () => {
      it('should return an order', done => {
        request
        .put(`${url}/api/inventories/${this.tempInventoryOrder._id}`)
        .send({test: 'asdfadsfa'})
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.test).to.equal('asdfadsfa');
          done();
        });
      });
    });

    describe('with an invalid ID', () => {
      it('should return a 404 error', done => {
        request
        .put(`${url}/api/inventories/invent`)
        .send({storeID: '0987'})
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });

    describe('with a valid ID, but no body', () => {
      it('should return a 400 error', done => {
        request
        .put(`${url}/api/inventories/${this.tempInventoryOrder._id}`)
        .send({})
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          expect(res.body).to.be.empty;
          done();
        });
      });
    });
  });

  describe('DELETE: /api/inventories/:inventoryID', () => {
    describe('with a valid ID', () => {
      it('should return a 204 status', done => {
        request
        .delete(`${url}/api/inventories/${this.tempInventoryOrder._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });

    describe('with an invalid ID', () => {
      it('should return a 404 not found error', done => {
        request
        .delete(`${url}/api/inventories/1234`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
