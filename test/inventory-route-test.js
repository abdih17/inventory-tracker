'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const Store = require('../model/store.js');
const InventoryProduct = require('../model/inventory.js');
const InventoryOrder = require('../model/cart.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleInventoryProduct = {
  name: 'Test name',
  desc: 'Test description',
  quantity: 12
};

const exampleInventoryOrder = {
  inventories: []
};

describe('Inventory Product Routes', function () {
  after(done => {
    Promise.all([
      InventoryProduct.remove({}),
      InventoryOrder.remove({}),
      Store.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/store/:storeID/inventory', () => {
    // beforeEach(done => {
    //   new InventoryProduct(exampleInventoryProduct).save()
    //   .then(inventory => {
    //     this.tempInventoryProduct = inventory;
    //     done();
    //   })
    //   .catch(done);
    // });

    before(done => {
      new Store(exampleInventoryProduct).save()
      .then(store => {
        this.tempStore = store;
        exampleInventoryOrder.storeID = store._id;
        return Store.addInventoryOrder(store._id, exampleInventoryOrder);
      })
      .then(inventoryOrder => {
        this.tempInventoryOrder = inventoryOrder;
        exampleInventoryProduct.orderID = inventoryOrder._id;
        done();
      })
      .catch(done);
    });

    describe('with a valid id and body', () => {
      it('should return an inventory', done => {
        request.post(`${url}/api/store/:storeID/inventory`)
        .send(exampleInventoryProduct)
        .end((err, res) => {
          if (err) return done(err);
          this.tempInventoryProduct = res.body;
          expect(res.status).to.equal(201);
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.be.equal(exampleInventoryProduct.name);
          expect(res.body.desc).to.be.equal(exampleInventoryProduct.desc);
          expect(res.body.quantity).to.equal(exampleInventoryProduct.quantity);
          expect(res.body.inventoryOrderID).to.equal(this.tempInventoryOrder._id.toString());
          done();
        });
      });
    });

    describe('with an invalid id', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/store/:storeID/hello`)
        .send(exampleInventoryProduct)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });

    describe('with an empty body', () =>  {
      it('should return a 404 status', done => {
        request.post(`${url}/api/store/:storeID/inventory`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });
    });

    describe('with a valid id, but invalid body', () => {
      it('should return a 400 status', done => {
        request
        .post(`${url}/api/store/${this.tempInventoryOrder._id}/inventory`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  //Second POST
  describe('POST: /api/inventoryOrders/:inventoryOrderID/inventory', () => {
    afterEach(done => {
      InventoryProduct.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('with a valid id and body', () => {
      it('should return an inventory', done => {
        request.post(`${url}/api/inventoryOrders/:inventoryOrderID/inventory`)
        .send(exampleInventoryProduct)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.be.equal(exampleInventoryProduct.name);
          expect(res.body.desc).to.be.equal(exampleInventoryProduct.desc);
          expect(res.body.quantity).to.equal(exampleInventoryProduct.quantity);
          expect(res.body.inventoryOrderID).to.equal(this.tempOrder._id.toString());
          done();
        });
      });
    });

    describe('with an invalid id', () =>  {
      it('should return a 404 status', done => {
        request.post(`${url}/api/inventoryOrders/:inventoryOrderID/in`)
        .send(exampleInventoryProduct)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });

    describe('with a valid id, but invalid body', () => {
      it('should return a 400 status', done => {
        request
        .post(`${url}/api/inventoryOrders/${this.tempInventoryOrder._id}/inventory`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with an empty body', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/inventoryOrders/:inventoryOrderID/inventory`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });
    });
  });

// GET Route
  describe('GET: /api/inventories/:inventoryProductID', () => {
    describe('with a valid id', () => {
      it('should return a product', done => {
        request
        .get(`${url}/api/inventories/${this.tempInventoryProduct._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(this.tempInventoryProduct.name);
          expect(res.body.desc).to.equal(this.tempInventoryProduct.desc);
          expect(res.body.quantity).to.equal(this.tempInventoryProduct.quantity);
          expect(res.body.productOrderID).to.equal(this.tempOrder._id.toString());
          done();
        });
      });
    });

    describe('with an invalid id', () => {
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

//PUT Route
  describe('PUT: /api/inventories/:inventoryProductID', () => {
    describe('with a valid id and body', () => {
      it('should return an updated product', done => {
        request
        .put(`${url}/api/inventories/${this.tempInventoryProduct._id}`)
        .send({name: 'New name'})
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('New name');
          expect(res.body.desc).to.equal(this.tempInventoryProduct.desc);
          expect(res.body.quantity).to.equal(this.tempInventoryProduct.quantity);
          expect(res.body.inventoryOrderID).to.equal(this.tempInventoryProduct.inventoryOrderID.toString());
          done();
        });
      });
    });

    describe('with an invalid ID', () => {
      it('should return a 404 error', done => {
        request
        .put(`${url}/api/inventories/69`)
        .send({name: 'New name'})
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });

    describe('with a valid ID, but invalid body', () => {
      it('should return a 400 error', done => {
        request
        .put(`${url}/api/inventories/${this.tempInventoryProduct._id}`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

//DELETE Route
  describe('DELETE: /api/inventories/:inventoryProductID', () => {
    describe('with a valid ID', () => {
      it('should return a 204 status', done => {
        request
        .delete(`${url}/api/inventories/${this.tempInventoryProduct._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });

    describe ('with an invalid ID', () => {
      it('should return a 404 status', done => {
        request
        .delete(`${url}/api/inventories/invent`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
