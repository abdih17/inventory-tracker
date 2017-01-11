'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const Employee = require('../model/employee.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleAdminEmployee = {
  name: 'Test Admin Name',
  username: 'testusername1',
  password: 'TestPW123',
  email: 'test1@example.com',
  admin: true
};

const exampleEmployeeUnassigned = {
  name: 'Test New Employee Name',
  username: 'testusername2',
  password: 'TestPW321',
  email: 'test2@example.com',
  admin: false
};

const exampleEmployeeAssigned = {
  name: 'Test Receiving Employee Name',
  username: 'testusername3',
  password: 'TestPW456',
  email: 'test3@example.com',
  admin: false,
  receiving: true
};

const exampleEmployeeDefaultUsername = {
  name: 'Test Default Name',
  password: 'TestPW789',
  email: 'test4@example.com',
  admin: false,
  receiving: true
};

const invalidEmployee = {
  nam: 'Invalid Name',
  username: 'testusernameinv',
  password: 'shucksTurtle99',
  email: 'test5@example.com',
  admin: true
};

const updatedEmployeePrivileges = {
  name: 'Updated Name',
  username: 'updatedname',
  email: 'test6@example.com',
  admin: false,
  shipping: true
};

describe('Employee route', function() {

  // ************** POST TESTS **************
  describe('POST: /api/employee/register', () => {
    afterEach(done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('With a valid body (create admin)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/employee/register`)
        .send(exampleAdminEmployee)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.text).to.be.a('string');
          expect(response.body).to.be.an('object');
          expect(response.body).to.be.empty;
          // console.log('***THIS IS THE RESPONSE BODY***', response.body);
          done();
        });
      });
    });

    describe('With a valid body (create unassigned employee)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/employee/register`)
        .send(exampleEmployeeUnassigned)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.text).to.be.a('string');
          expect(response.body).to.be.an('object');
          expect(response.body).to.be.empty;
          done();
        });
      });
    });

    describe('With a valid body (create assigned, non-admin employee)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/employee/register`)
        .send(exampleEmployeeAssigned)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.text).to.be.a('string');
          expect(response.body).to.be.an('object');
          expect(response.body).to.be.empty;
          done();
        });
      });
    });

    describe('With a valid body (employee with default email username)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/employee/register`)
        .send(exampleEmployeeDefaultUsername)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.text).to.be.a('string');
          expect(response.body).to.be.an('object');
          expect(response.body).to.be.empty;
          done();
        });
      });
    });

    describe('With an invalid body', () => {
      it('should return a 400 \'bad request\' error', done => {
        request.post(`${url}/api/employee/register`)
        .send(invalidEmployee)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          expect(response.body).to.be.an('object');
          expect(response.body).to.be.empty;
          done();
        });
      });
    });

    describe('With an empty body', () => {
      it('should return a 400 \'bad request\' error', done => {
        request.post(`${url}/api/employee/register`)
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
});
