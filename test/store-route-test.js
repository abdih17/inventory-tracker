'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Store = require('../model/store.js');
const Customer = require('../model/customer.js');
const CartOrder = require('../model/cart-order.js');

const server = require('../server.js');
const serverToggle = require('./lib/server-toggle.js');

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

const exampleStore = {
  name: 'Example Store',
  storeNumber: '4444',
  address: '0000 ExampleStreet, SomeCity, State, 00000',
  timestamp: new Date()
};

const badRequestExample = {
  nam: 'Example Store',
  storeNumber: '4444',
  address: '0000 ExampleStreet, SomeCity, State, 00000',
  timestamp: new Date()
};

describe('Store Routes', function() {
  before(done => {
    serverToggle.startServer(server, done);
  });

  after(done => {
    serverToggle.stopServer(server, done);
  });

  // POST --------------------------------------------------------
  describe('POST: /api/store', function() {
    describe('with a valid body', function() {
      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a store', done => {
        request.post(`${url}/api/store`)
        .send(exampleStore)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleStore.name);
          expect(res.body.storeNumber).to.equal(exampleStore.storeNumber);
          expect(res.body.address).to.equal(exampleStore.address);
          this.tempStore = res.body;
          done();
        });
      });
    });

    describe('with a invalid body', function() {
      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a 400 error', done => {
        request.post(`${url}/api/store`)
        .send(badRequestExample)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.name).to.not.equal(exampleStore.name);
          expect(res.body.storeNumber).to.not.equal(exampleStore.storeNumber);
          expect(res.body.address).to.not.equal(exampleStore.address);
          done();
        });
      });
    });
  });

  // GET ----------------------------------------------------------------
  describe('GET: /api/store/:id', function() {
    describe('with a valid id', function() {
      before( done => {
        new Store(exampleStore).save()
        .then( store => {
          this.tempStore = store;
          sampleOrder.storeID = store._id;
          return new Customer(sampleCustomer).save();
        })
        .then( customer => {
          this.tempCustomer = customer;
          sampleOrder.customerID = customer._id;
          return Customer.addCartOrder(customer._id, this.tempStore._id, sampleOrder);
        })
        .then( order => {
          this.tempOrder = order;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempStore) {
          Promise.all([
            Store.remove({}),
            Customer.remove({}),
            CartOrder.remove({})
          ])
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a store', done => {
        request.get(`${url}/api/store/${this.tempStore._id}`)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.body.outgoing.length).to.equal(1);
          expect(res.body.outgoing[0].storeID).to.equal(res.body._id.toString());
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleStore.name);
          done();
        });
      });
    });

    describe('with an invalid id', function() {
      before( done => {
        new Store(exampleStore).save()
        .then( store => {
          this.tempStore = store;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a 404', done => {
        request.get(`${url}/api/store/111111111111111111`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.name).to.not.equal(exampleStore.name);
          done();
        });
      });
    });
  });

  describe('With no ID', () => {
    before( done => {
      new Store(exampleStore).save()
      .then( store => {
        this.tempStore = store;
        done();
      })
      .catch(done);
    });

    after( done => {
      if(this.tempStore) {
        Store.remove({})
        .then( () => done())
        .catch(done);
        return;
      }
      done();
    });

    it('should return an array of IDs', done => {
      request
      .get(`${url}/api/store`)
      .end((err, response) => {
        if (err) return done(err);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body).to.include(this.tempStore._id.toString());
        done();
      });
    });
  });

  // PUT -----------------------------------------------------------------------
  describe('PUT: /api/store/:id', function() {
    describe('with a valid id and body', function() {
      before( done => {
        new Store(exampleStore).save()
        .then( store => {
          this.tempStore = store;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a store', done => {
        var updated = { name: 'Updated Name' };

        request.put(`${url}/api/store/${this.tempStore._id}`)
        .send(updated)
        .end((err, res) => {
          if(err) return done(err);
          let timestamp = new Date(res.body.timestamp);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(updated.name);
          expect(timestamp.toString()).to.equal(exampleStore.timestamp.toString());
          done();
        });
      });
    });

    describe('with a valid id and invalid body', function() {
      before( done => {
        new Store(exampleStore).save()
        .then( store => {
          this.tempStore = store;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a 400', done => {

        request.put(`${url}/api/store/${this.tempStore._id}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with an invalid id and valid body', function() {
      before( done => {
        new Store(exampleStore).save()
        .then( store => {
          this.tempStore = store;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a 404', done => {

        request.put(`${url}/api/store/111111111111`)
        .send(badRequestExample)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
  // DELETE --------------------------------------------------------------------
  describe('DELETE: /api/store/:id', function() {
    describe('with a valid id', function() {
      before( done => {
        new Store(exampleStore).save()
        .then( store => {
          this.tempStore = store;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should respond with a 204', done => {
        request.delete(`${url}/api/store/${this.tempStore._id}`)
        .end((err, res) => {
          expect(res.status).to.equal(204);
          expect(res.status).to.not.equal(404);
          expect(res.status).to.not.equal(400);
          expect(res.status).to.not.equal(500);
          done();
        });
      });
    });

    describe('with an invalid id', function() {
      before( done => {
        new Store(exampleStore).save()
        .then( store => {
          this.tempStore = store;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempStore) {
          Store.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should respond with a 404', done => {
        request.delete(`${url}/api/store/1111111111111`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.status).to.not.equal(200);
          expect(res.status).to.not.equal(204);
          expect(res.status).to.not.equal(400);
          expect(res.status).to.not.equal(500);
          done();
        });
      });
    });
  });
});
