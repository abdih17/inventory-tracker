'use strict';

const expect = require('chai').expect;
const request = require('superagent');
// const mongoose = require('mongoose');
// const Promise = require('bluebird');
const Inventory = require('../model/inventory.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleInventory = {
  name: 'Test name',
  desc: 'Test description',
  quantity: '12'
};

const invalidInventory = {
  nam: 'Test nam',
  desc: 'Test desc',
  quantity: '24'
};

// const updatedInventory = {
//   name: 'Updated name',
//   desc: 'Updated desc',
//   quantity: '48'
// };

describe('Inventory Route', function () {
  describe('POST: /api/store/:storeID/inventory', () => {
    afterEach(done => {
      Inventory.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('with a valid body', () => {
      it('should return an inventory', done => {
        request.post(`${url}/api/store/:storeID/inventory`)
        .send(exampleInventory)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.be.equal(exampleInventory.name);
          expect(res.body.desc).to.be.equal(exampleInventory.desc);
          expect(res.body.quantity).to.be.equal(12);
          done();
        });
      });
    });

    describe('with an invalid body', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/store/:storeID/inventory`)
        .send(invalidInventory)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          expect(res.body).to.not.equal(invalidInventory.name);
          done();
        });
      });
    });

    describe('with an empty body', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/store/:storeID/inventory`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });
    });
  });

  describe('POST: /api/inventoryOrder/:inventoryOrderID/inventory', () => {
    afterEach(done => {
      Inventory.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('with a valid body', () => {
      it('should return an inventory', done => {
        request.post(`${url}/api/inventoryOrder/:inventoryOrderID/inventory`)
        .send(exampleInventory)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.be.equal(exampleInventory.name);
          expect(res.body.desc).to.be.equal(exampleInventory.desc);
          expect(res.body.quantity).to.be.equal(12);
          done();
        });
      });
    });

    describe('with an invalid body', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/inventoryOrder/:inventoryOrderID/inventory`)
        .send(invalidInventory)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          expect(res.body).to.not.equal(invalidInventory.name);
          done();
        });
      });
    });

    describe('with an empty body', () =>  {
      it('should return a 400 status', done => {
        request.post(`${url}/api/inventoryOrder/:inventoryOrderID/inventory`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.empty;
          done();
        });
      });
    });
  });

  describe('GET: /api/inventory/:id', function() {
    describe('with a valid body', function () {
      before( done => {
        let inventory = new Inventory(exampleInventory);

        inventory.save()
        .then( inventory => {
          this.tempInventory = inventory;
          done();
        })
        .catch(done);
      });

      after( done => {
        Inventory.remove({})
        .then(() => done())
        .catch(done);
      });

      it('should return an inventory', done => {
        request.get(`${url}/api/inventory/${this.tempInventory._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('Test name');
          expect(res.body.desc).to.equal('Test description');
          expect(res.body.quantity.toString()).to.equal(exampleInventory.quantity);
          done();
        });
      });
    });

    describe('with an invalid inventory id', () => {
      it('should return a 404 status', done => {
        request.get(`${url}/api/inventory/23`)
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
