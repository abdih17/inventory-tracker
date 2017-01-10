'use strict';

const expect = require('chai').expect;
const request = require('superagent');
// const mongoose = require('mongoose');
// const Promise = require('bluebird');
const Customer = require('../model/customer.js');
const url = `http://localhost:${process.env.PORT}`;

require('../server.js');

const exampleCustomer = {
  name: 'Test name',
  username: 'Test username',
  password: 'Testword',
  email: 'test@test.com',
  address: '12345 nowheresville, test city, test state, 99999'
};

const invalidCustomer = {
  nam: 'Shit turtle',
  username: 'Test username',
  password: 'Testword',
  email: 'test@test.com',
  address: '12345 nowheresville, test city, test state, 99999'
};

const updatedCustomer = {
  username: 'Usernam',
  name: 'Nam',
  address: 'addnam',
  email: 'nam@nam.nam',
  password: 'newPassword'
};

describe('Customer route', function() {
  describe('POST: /api/signup', () => {
    afterEach(done => {
      Customer.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('With a valid body', () => {
      it('should return a username', done => {
        request
        .post(`${url}/api/signup`)
        .send(exampleCustomer)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.body).to.be.a('string');
          expect(response.body).to.equal(exampleCustomer.username);
          done();
        });
      });
    });

    describe('With an invalid body', () => {
      it('should return a 400 status', done => {
        request
        .post(`${url}/api/signup`)
        .send(invalidCustomer)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          expect(response.body).to.not.equal(invalidCustomer.username);
          done();
        });
      });
    });

    describe('With an empty body', () => {
      it('should return a 400 status', done => {
        request
        .post(`${url}/api/signup`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          expect(response.body).to.be.an('object');
          expect(response.body).to.be.empty;
          done();
        });
      });
    });
  });

  describe('GET: /api/signin', () => {
    before(done => {
      let customer = new Customer(exampleCustomer);

      customer.hashPassword(customer.password)
      .then(customer => customer.save())
      .then(customer => {
        this.tempCustomer = customer;
        done();
      })
      .catch(done);
    });

    after(done => {
      Customer.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('with a valid body', () => {
      it('should return a 200 status', done => {
        request
        .get(`${url}/api/signin`)
        .auth('Test username', 'Testword')
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.text).to.be.a('string');
          expect(response.text).to.equal('Successful login');
          done();
        });
      });
    });

    describe('With an invalid password', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .auth('Test username', 'Password')
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(401);
          done();
        });
      });
    });

    describe('With an invalid username', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .auth('Test usernam', 'Testword')
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('PUT: /api/customer/:customerID', () => {
    before(done => {
      let customer = new Customer(exampleCustomer);

      customer.hashPassword(customer.password)
      .then(customer => customer.save())
      .then(customer => {
        this.tempCustomer = customer;
        done();
      })
      .catch(done);
    });

    after(done => {
      Customer.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('With a valid ID and body', () => {
      it('should return a 200 status', done => {
        request
        .put(`${url}/api/customer/${this.tempCustomer._id}`)
        .auth('Test username', 'Testword')
        .send(updatedCustomer)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.text).to.equal('Update successful');
          done();
        });
      });
    });

    describe('With an invalid ID but valid body', () => {
      it('should return a 404 status', done => {
        request
        .put(`${url}/api/customer/69`)
        .auth('Test username', 'Testword')
        .send(updatedCustomer)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });

    describe('With a valid ID, but invalid auth', () => {
      it('should return a 401 status', done => {
        request
        .put(`${url}/api/customer/${this.tempCustomer._id}`)
        .send(updatedCustomer)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(401);
          done();
        });
      });
    });
  });
});
