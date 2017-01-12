'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const Store = require('../model/store.js');
const InventoryProduct = require('../model/inventory-product.js');
const InventoryOrder = require('../model/inventory-order.js');

const server = require('../server.js');
const serverToggle = require('./lib/server-toggle.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleInventoryProduct = {
  name: 'Test name',
  desc: 'Test description',
  quantity: 12
};

const exampleInventoryOrder = {
  inventories: []
};

const exampleStore = {
  name: 'Test name',
  storeNumber: '1234',
  address: 'Test address',
  timestamp: Date.now()
};

describe('Inventory Product Routes', function () {
  before(done => {
    serverToggle.startServer(server, done);
  });

  after(done => {
    Promise.all([
      InventoryProduct.remove({}),
      InventoryOrder.remove({}),
      Store.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  after(done => {
    serverToggle.stopServer(server, done);
  });

  describe('POST: /api/store/:storeID/inventory', () => {
    before(done => {
      new Store(exampleStore).save()
      .then(store => {
        this.tempStore = store;
        return Store.addInventoryOrder(store._id, exampleInventoryOrder);
      })
      .then(inventoryOrder => {
        this.tempInventoryOrder = inventoryOrder;
        exampleInventoryProduct.orderID = inventoryOrder._id;
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    after(done => {
      Promise.all([
        InventoryProduct.remove({}),
        InventoryOrder.remove({}),
        Store.remove({})
      ])
      .then(() => done())
      .catch(done);
    });

    describe('with a valid id and body', () => {
      it('should return an inventory', done => {
        request.post(`${url}/api/store/${this.tempStore._id}/inventory`)
        .send(exampleInventoryProduct)
        .end((err, res) => {
          if (err) return done(err);
          this.tempInventoryProduct = res.body;
          expect(res.status).to.equal(201);
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.be.equal(exampleInventoryProduct.name);
          expect(res.body.desc).to.be.equal(exampleInventoryProduct.desc);
          expect(res.body.quantity).to.equal(exampleInventoryProduct.quantity);
          expect(res.body.storeID).to.equal(this.tempStore._id.toString());
          done();
        });
      });
    });

    describe('with an invalid id', () =>  {
      it('should return a 404 status', done => {
        request.post(`${url}/api/store/hello/inventory`)
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
        request.post(`${url}/api/store/${this.tempStore._id}/inventory`)
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
        .post(`${url}/api/store/${this.tempStore._id}/inventory`)
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
    beforeEach(done => {
      new Store(exampleStore).save()
      .then(store => {
        this.tempStore = store;
        return Store.addInventoryOrder(store._id, exampleInventoryOrder);
      })
      .then(inventoryOrder => {
        this.tempInventoryOrder = inventoryOrder;
        exampleInventoryProduct.orderID = inventoryOrder._id;
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    afterEach(done => {
      Promise.all([
        InventoryProduct.remove({}),
        InventoryOrder.remove({}),
        Store.remove({})
      ])
      .then(() => done())
      .catch(done);
    });

    describe('with a valid id and body', () => {
      it('should return an inventory', done => {
        request.post(`${url}/api/inventoryOrders/${this.tempInventoryOrder._id}/inventory`)
        .send(exampleInventoryProduct)
        .end((err, res) => {
          if (err) return done(err);
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
      it('should return a 404 status', done => {
        request.post(`${url}/api/inventoryOrders/1234/inventory`)
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
        console.log(this.tempInventoryOrder);
        request
        .post(`${url}/api/inventoryOrders/${this.tempInventoryOrder._id}/inventory`)
        .send({nam: 'test invalid'})
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with an empty body', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/inventoryOrders/${this.tempInventoryOrder._id}/inventory`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });
    });
  });

// GET Route
  describe('GET: /api/inventory/:inventoryProductID', () => {
    beforeEach(done => {
      new Store(exampleStore).save()
      .then(store => {
        this.tempStore = store;
        return Store.addInventoryOrder(store._id, exampleInventoryOrder);
      })
      .then(inventoryOrder => {
        this.tempInventoryOrder = inventoryOrder;
        return InventoryOrder.addInventoryProduct(inventoryOrder._id, exampleInventoryProduct);
      })
      .then(product => {
        this.tempInventoryProduct = product;
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    afterEach(done => {
      Promise.all([
        InventoryProduct.remove({}),
        InventoryOrder.remove({}),
        Store.remove({})
      ])
      .then(() => done())
      .catch(done);
    });

    describe('with a valid id', () => {
      it('should return a product', done => {
        request
        .get(`${url}/api/inventory/${this.tempInventoryProduct._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(this.tempInventoryProduct.name);
          expect(res.body.desc).to.equal(this.tempInventoryProduct.desc);
          expect(res.body.quantity).to.equal(this.tempInventoryProduct.quantity);
          expect(res.body.inventoryOrderID).to.equal(this.tempInventoryOrder._id.toString());
          done();
        });
      });
    });

    describe('With no ID', () => {
      it('should return an array of products', done => {
        request
        .get(`${url}/api/inventory`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('array');
          expect(response.body).to.include(this.tempInventoryProduct._id.toString());
          done();
        });
      });
    });

    describe('with an invalid id', () => {
      it('should return a 404 error', done => {
        request
        .get(`${url}/api/inventory/1234`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

//PUT Route
  describe('PUT: /api/inventory/:inventoryProductID', () => {
    beforeEach(done => {
      new Store(exampleStore).save()
      .then(store => {
        this.tempStore = store;
        return Store.addInventoryOrder(store._id, exampleInventoryOrder);
      })
      .then(inventoryOrder => {
        this.tempInventoryOrder = inventoryOrder;
        return InventoryOrder.addInventoryProduct(inventoryOrder._id, exampleInventoryProduct);
      })
      .then(product => {
        this.tempInventoryProduct = product;
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    afterEach(done => {
      Promise.all([
        InventoryProduct.remove({}),
        InventoryOrder.remove({}),
        Store.remove({})
      ])
      .then(() => done())
      .catch(done);
    });
    describe('with a valid id and body', () => {

      it('should return an updated product', done => {
        request
        .put(`${url}/api/inventory/${this.tempInventoryProduct._id}`)
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
        .put(`${url}/api/inventory/69`)
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
        .put(`${url}/api/inventory/${this.tempInventoryProduct._id}`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with a valid ID, but no body', () => {
      it('should return a 400 error', done => {
        request
        .put(`${url}/api/inventory/${this.tempInventoryProduct._id}`)
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

//DELETE Route
  describe('DELETE: /api/inventory/:inventoryID', () => {
    beforeEach(done => {
      new Store(exampleStore).save()
      .then(store => {
        this.tempStore = store;
        return Store.addInventoryOrder(store._id, exampleInventoryOrder);
      })
      .then(inventoryOrder => {
        this.tempInventoryOrder = inventoryOrder;
        return InventoryOrder.addInventoryProduct(inventoryOrder._id, exampleInventoryProduct);
      })
      .then(product => {
        this.tempInventoryProduct = product;
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    afterEach(done => {
      Promise.all([
        InventoryProduct.remove({}),
        InventoryOrder.remove({}),
        Store.remove({})
      ])
      .then(() => done())
      .catch(done);
    });

    describe('with a valid ID', () => {
      it('should return a 204 status', done => {
        request
        .delete(`${url}/api/inventory/${this.tempInventoryProduct._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          expect(res.body).to.be.empty;
          done();
        });
      });
    });

    describe ('with an invalid ID', () => {
      it('should return a 404 status', done => {
        request
        .delete(`${url}/api/inventory/invent`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          // expect(res.body).to.not.be.empty;
          done();
        });
      });
    });
  });

  describe('GET: /api/inventory with no ID, but no data', () => {
    before(done => {
      InventoryProduct.remove({})
      .then(() => done())
      .catch(done);
    });

    it('should return a 416 error', done => {
      request
      .get(`${url}/api/inventory`)
      .end((err, response) => {
        expect(err).to.be.an('error');
        expect(response.status).to.equal(416);
        done();
      });
    });
  });
});
