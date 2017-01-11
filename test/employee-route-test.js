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

  // ************** GET TESTS **************
  describe('GET: /api/signin', () => {
    after(done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('with a valid body (admin employee)', () => {
      before( done => {
        let employeeAdmin = new Employee(exampleAdminEmployee);

        employeeAdmin.hashPassword(employeeAdmin.password)
        .then(employeeAdmin => employeeAdmin.save())
        .then(employeeAdmin => {
          this.tempEmployeeAdmin = employeeAdmin;
          done();
        })
        .catch(done);
      });

      it('should return a 200 status', done => {
        request.get(`${url}/api/employee/signin`)
        .auth('testusername1', 'TestPW123')
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal(exampleAdminEmployee.name);
          expect(response.body.username).to.equal(exampleAdminEmployee.username);
          expect(response.body.email).to.equal(exampleAdminEmployee.email);
          expect(response.body.admin).to.equal(true);
          expect(response.body.password).to.equal(undefined);
          done();
        });
      });
    });

    describe('with a valid body (new employee, role unassigned)', () => {
      before( done => {
        let employeeUnassigned = new Employee(exampleEmployeeUnassigned);

        employeeUnassigned.hashPassword(employeeUnassigned.password)
        .then(employeeUnassigned => employeeUnassigned.save())
        .then(employeeUnassigned => {
          this.tempEmployeeUnassigned = employeeUnassigned;
          done();
        })
        .catch(done);
      });

      it('should return a 200 status', done => {
        request.get(`${url}/api/employee/signin`)
        .auth('testusername2', 'TestPW321')
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal(exampleEmployeeUnassigned.name);
          expect(response.body.username).to.equal(exampleEmployeeUnassigned.username);
          expect(response.body.email).to.equal(exampleEmployeeUnassigned.email);
          expect(response.body.admin).to.equal(false);
          expect(response.body.receiving).to.equal(false);
          expect(response.body.shipping).to.equal(false);
          expect(response.body.password).to.equal(undefined);
          done();
        });
      });
    });

    describe('with a valid body (non-admin, assigned employee)', () => {
      before( done => {
        let employeeAssigned = new Employee(exampleEmployeeAssigned);

        employeeAssigned.hashPassword(employeeAssigned.password)
        .then(employeeAssigned => employeeAssigned.save())
        .then(employeeAssigned => {
          this.tempEmployeeAssigned = employeeAssigned;
          done();
        })
        .catch(done);
      });

      it('should return a 200 status', done => {
        request.get(`${url}/api/employee/signin`)
        .auth('testusername3', 'TestPW456')
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal(exampleEmployeeAssigned.name);
          expect(response.body.username).to.equal(exampleEmployeeAssigned.username);
          expect(response.body.email).to.equal(exampleEmployeeAssigned.email);
          expect(response.body.admin).to.equal(false);
          expect(response.body.receiving).to.equal(true);
          expect(response.body.shipping).to.equal(false);
          expect(response.body.password).to.equal(undefined);
          done();
        });
      });
    });

    describe('with a valid body (employee with default username, equal to email)', () => {
      before( done => {
        let employeeDefaultUsername = new Employee(exampleEmployeeDefaultUsername);

        employeeDefaultUsername.hashPassword(employeeDefaultUsername.password)
        .then(employeeDefaultUsername => employeeDefaultUsername.save())
        .then(employeeDefaultUsername => {
          this.tempEmployeeDefaultUsername = employeeDefaultUsername;
          done();
        })
        .catch(done);
      });

      it('should return a 200 status', done => {
        request.get(`${url}/api/employee/signin`)
        .auth('test4@example.com', 'TestPW789')
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal(exampleEmployeeDefaultUsername.name);
          expect(response.body.username).to.equal(exampleEmployeeDefaultUsername.email);
          expect(response.body.email).to.equal(exampleEmployeeDefaultUsername.email);
          expect(response.body.admin).to.equal(false);
          expect(response.body.receiving).to.equal(true);
          expect(response.body.password).to.equal(undefined);
          done();
        });
      });
    });

    describe('With an invalid password for a valid username', () => {
      it('should return a 401 \'unauthorized\' error', done => {
        request.get(`${url}/api/employee/signin`)
        .auth('testusername1', 'InvalidPassword')
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(401);
          done();
        });
      });
    });

    describe('With an invalid username', () => {
      it('should return a 401 \'unauthorized\' error', done => {
        request.get(`${url}/api/employee/signin`)
        .auth('testturtle82', 'shucksTurtle39')
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(401);
          done();
        });
      });
    });
  });

  // ************** PUT TESTS **************
  // TODO: BUILD OUT PUT TESTS
  describe('PUT: /api/employee/:employeeID', () => {
    before( done => {
      let employeeAdmin = new Employee(exampleAdminEmployee);

      employeeAdmin.hashPassword(employeeAdmin.password)
      .then(employeeAdmin => employeeAdmin.save())
      .then(employeeAdmin => {
        this.tempEmployeeAdmin = employeeAdmin;
        return employeeAdmin.generateToken();
      })
      .then( tokenEmployeeAdmin => {
        this.tempTokenEmployeeAdmin = tokenEmployeeAdmin;
        done();
      })
      .catch(done);
    });

    // before( done => {
    //   let employeeUnassigned = new Employee(exampleEmployeeUnassigned);
    //
    //   employeeUnassigned.hashPassword(employeeUnassigned.password)
    //   .then(employeeUnassigned => employeeUnassigned.save())
    //   .then(employeeUnassigned => {
    //     this.tempEmployeeUnassigned = employeeUnassigned;
    //     done();
    //   })
    //   .catch(done);
    // });
    //
    // before( done => {
    //   let employeeAssigned = new Employee(exampleEmployeeAssigned);
    //
    //   employeeAssigned.hashPassword(employeeAssigned.password)
    //   .then(employeeAssigned => employeeAssigned.save())
    //   .then(employeeAssigned => {
    //     this.tempEmployeeAssigned = employeeAssigned;
    //     done();
    //   })
    //   .catch(done);
    // });
    //
    // before( done => {
    //   let employeeDefaultUsername = new Employee(exampleEmployeeDefaultUsername);
    //
    //   employeeDefaultUsername.hashPassword(employeeDefaultUsername.password)
    //   .then(employeeDefaultUsername => employeeDefaultUsername.save())
    //   .then(employeeDefaultUsername => {
    //     this.tempEmployeeDefaultUsername = employeeDefaultUsername;
    //     done();
    //   })
    //   .catch(done);
    // });

    after(done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('**************With a valid ID and body (admin employee)', () => {
      it('should return a 200 status', done => {
        request.put(`${url}/api/employee/${this.tempEmployeeAdmin._id}`)
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeAdmin}`
        })
        .send({ username: 'updatedname1', email: 'test55@example.com' })
        .end((err, response) => {
          if (err) return done(err);
          console.log(this.tempTokenEmployeeAdmin);
          expect(response.status).to.equal(200);
          expect(response.text).to.equal('Update successful');
          done();
        });
      });
    });

    describe('With an invalid ID but valid body', () => {
      it('should return a 404 status', done => {
        request.put(`${url}/api/employee/69538438567u238472`)
        .send({ username: 'updatedinv1', email: 'test55@example.com' })
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeAdmin}`
        })
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });

    describe('With a valid ID, but invalid auth', () => {
      it('should return a 401 status', done => {
        request.put(`${url}/api/employee/${this.tempEmployeeAdmin._id}`)
        .send({ username: 'updatedinv2', email: 'test55@example.com' })
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(401);
          done();
        });
      });
    });

    describe('With a valid ID, valid auth, but no body', () => {
      it('should return a 400 status', done => {
        request.put(`${url}/api/employee/${this.tempEmployeeAdmin._id}`)
        .send('')
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeAdmin}`
        })
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });

  // describe('With a valid ID and body (admin employee)', next)
  // username: 'testusername1',
  // password: 'TestPW123',
  //
  // describe('With a valid ID and body (new employee, role unassigned)', next)
  // username: 'testusername2',
  // password: 'TestPW321',
  //
  // describe('With a valid ID and body (non-admin, assigned employee)', next)
  // username: 'testusername3',
  // password: 'TestPW456',
  //
  // describe('With a valid ID and body (employee with default username, equal to email)', next)
  // username: 'test4@example.com',
  // password: 'TestPW789',

  // ************** DELETE TESTS **************
  // TODO: BUILD OUT DELETE TESTS
});
