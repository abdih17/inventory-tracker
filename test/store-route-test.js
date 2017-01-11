'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Store = require('../model/store.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

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
        request.get(`${url}/api/store/${this.tempStore._id}`)
        .end((err, res) => {
          if(err) return done(err);
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
        var updated = { name: 'Upadated Name' };

        request.put(`${url}/api/store/111111111111`)
        .send(updated)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.name).to.not.equal(updated.name);
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
