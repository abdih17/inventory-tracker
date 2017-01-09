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

describe('Customer route', function() {
  after(done => {
    Customer.remove({})
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/signup', () => {
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
  });
});
