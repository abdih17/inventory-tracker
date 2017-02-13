'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const Employee = require('../model/employee.js');
const Store = require('../model/store.js');

mongoose.Promise = Promise;

const server = require('../server.js');
const serverToggle = require('./lib/server-toggle.js');

const url = `http://localhost:${process.env.PORT}`;

const sampleStore = {
  name: 'Test store',
  address: 'Test store address',
  storeNumber: '0555'
};

const exampleAdminEmployee = {
  name: 'Test Admin Name',
  username: 'testusername1',
  password: 'TestPW123',
  email: 'test1@example.com',
  admin: true
};

const exampleAdminEmployeeB = {
  name: 'Test Admin NameB',
  username: 'testusername1B',
  password: 'TestPW123B',
  email: 'test1@example.comB',
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
  shipping: true
};

describe('Employee route', function() {
  before(done => {
    serverToggle.startServer(server, done);
  });

  after(done => {
    Store.remove({})
    .then(() => done())
    .catch(done);
  });

  after(done => {
    serverToggle.stopServer(server, done);
  });

  // ************** POST TESTS **************
  describe('POST: /api/store/:storeID/employee', () => {
    beforeEach(done => {
      new Store(sampleStore).save()
      .then(store => {
        exampleAdminEmployeeB.storeID = store._id;
        exampleAdminEmployee.storeID = store._id;
        exampleEmployeeUnassigned.storeID = store._id;
        exampleEmployeeAssigned.storeID = store._id;
        exampleEmployeeDefaultUsername.storeID = store._id;
        invalidEmployee.storeID = store._id;
        updatedEmployeePrivileges.storeID = store._id;
        this.tempStore = store;
        done();
      })
      .catch(done);
    });

    afterEach(done => {
      Promise.all([
        Employee.remove({}),
        Store.remove({})
      ])
      .then(() => done())
      .catch(done);
    });

    describe('With a valid body (create admin)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/store/${this.tempStore._id}/employee`)
        .send(exampleAdminEmployee)
        .end((err, response) => {
          if (err) return done(err);
          Store.findById(this.tempStore._id)
          .then(store => {
            expect(response.status).to.equal(201);
            expect(store.employees.length).to.equal(1);
            expect(response.body).to.be.an('object');
            expect(response.body.name).to.equal(exampleAdminEmployee.name);
            expect(response.body.username).to.equal(exampleAdminEmployee.username);
            expect(response.body._id).to.be.a('string');
            done();
          });
        });
      });
    });

    describe('With a valid body (create unassigned employee)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/store/${this.tempStore._id}/employee`)
        .send(exampleEmployeeUnassigned)
        .end((err, response) => {
          if (err) return done(err);
          Store.findById(this.tempStore._id)
          .then(store => {
            expect(response.status).to.equal(201);
            expect(store.employees.length).to.equal(1);
            expect(response.body).to.be.an('object');
            expect(response.body.name).to.equal(exampleEmployeeUnassigned.name);
            expect(response.body.username).to.equal(exampleEmployeeUnassigned.username);
            expect(response.body._id).to.be.a('string');
            done();
          });
        });
      });
    });

    describe('With a valid body (create assigned, non-admin employee)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/store/${this.tempStore._id}/employee`)
        .send(exampleEmployeeAssigned)
        .end((err, response) => {
          if (err) return done(err);
          Store.findById(this.tempStore._id)
          .then(store => {
            expect(response.status).to.equal(201);
            expect(store.employees.length).to.equal(1);
            expect(response.body).to.be.an('object');
            expect(response.body.name).to.equal(exampleEmployeeAssigned.name);
            expect(response.body.username).to.equal(exampleEmployeeAssigned.username);
            expect(response.body._id).to.be.a('string');
            done();
          });
        });
      });
    });

    describe('With a valid body (employee with default email username)', () => {
      it('should return a token', done => {
        request.post(`${url}/api/store/${this.tempStore._id}/employee`)
        .send(exampleEmployeeDefaultUsername)
        .end((err, response) => {
          if (err) return done(err);
          Store.findById(this.tempStore._id)
          .then(store => {
            expect(response.status).to.equal(201);
            expect(store.employees.length).to.equal(1);
            expect(response.body).to.be.an('object');
            expect(response.body.name).to.equal(exampleEmployeeDefaultUsername.name);
            expect(response.body.username).to.equal(exampleEmployeeDefaultUsername.email);
            expect(response.body._id).to.be.a('string');
            done();
          });
        });
      });
    });

    describe('With an invalid body', () => {
      it('should return a 400 \'bad request\' error', done => {
        request.post(`${url}/api/store/${this.tempStore._id}/employee`)
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
        request.post(`${url}/api/store/${this.tempStore._id}/employee`)
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

    describe('With no ID', () => {
      before( done => {
        let employeeAdminB = new Employee(exampleAdminEmployeeB);

        employeeAdminB.hashPassword(employeeAdminB.password)
        .then(employeeAdmin => employeeAdmin.save())
        .then(employeeAdmin => {
          this.tempEmployeeAdminB = employeeAdmin;
          done();
        })
        .catch(done);
      });

      after( done => {
        Employee.findByIdAndRemove(this.tempEmployeeAdminB._id)
        .then(() => done())
        .catch(done);
      });

      it('should return an array of employees', done => {
        request
        .get(`${url}/api/employee`)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.at.least(1);
          done();
        });
      });
    });

    describe('GET: /api/employee with no ID, but no data', () => {
      before(done => {
        Employee.remove({})
        .then(() => done())
        .catch(done);
      });

      it('should return a 416 error', done => {
        request
        .get(`${url}/api/employee`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(416);
          done();
        });
      });
    });
  });

  describe('PUT to admin ID (valid request, valid auth)', () => {
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

    after( done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    it('should return a 200 status', done => {
      request.put(`${url}/api/employee/${this.tempEmployeeAdmin._id}`)
      .set({
        Authorization: `Bearer ${this.tempTokenEmployeeAdmin}`
      })
      .send({ username: 'updatedname1', email: 'test55@example.com' })
      .end((err, response) => {
        if (err) return done(err);
        expect(response.status).to.equal(200);
        expect(response.text).to.equal('Update successful');
        done();
      });
    });
  });

  describe('PUT to NON-admin ID (Attempt by non-admin to make self admin)', () => {
    before( done => {
      let employeeAssigned = new Employee(exampleEmployeeAssigned);

      employeeAssigned.hashPassword(employeeAssigned.password)
      .then(employeeAssigned => employeeAssigned.save())
      .then(employeeAssigned => {
        this.tempEmployeeAssigned = employeeAssigned;
        return employeeAssigned.generateToken();
      })
      .then( tokenEmployeeAssigned => {
        this.tempTokenEmployeeAssigned = tokenEmployeeAssigned;
        done();
      })
      .catch(done);
    });

    after( done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    it('should return a 403 \'forbidden\' error', done => {
      request.put(`${url}/api/employee/${this.tempEmployeeAssigned._id}`)
      .set({
        Authorization: `Bearer ${this.tempTokenEmployeeAssigned}`
      })
      .send({ username: 'updatedname1', email: 'test55@example.com', admin: true })
      .end((err, response) => {
        expect(err).to.be.an('error');
        expect(response.status).to.equal(403);
        done();
      });
    });
  });

  describe('PUT: /api/employee/:employeeID (other misc. cases)', () => {
    after( done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('With a valid ID and body (NON-admin employee)', () => {
      before( done => {
        let employeeDefaultUsername = new Employee(exampleEmployeeDefaultUsername);

        employeeDefaultUsername.hashPassword(employeeDefaultUsername.password)
        .then(employeeDefaultUsername => employeeDefaultUsername.save())
        .then(employeeDefaultUsername => {
          this.tempEmployeeDefaultUsername = employeeDefaultUsername;
          return employeeDefaultUsername.generateToken();
        })
        .then( tokenEmployeeDefaultUsername => {
          this.tempTokenEmployeeDefaultUsername = tokenEmployeeDefaultUsername;
          done();
        })
        .catch(done);
      });

      it('should return a 200 status', done => {
        request.put(`${url}/api/employee/${this.tempEmployeeDefaultUsername._id}`)
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeDefaultUsername}`
        })
        .send({ username: 'updatedname1', email: 'test55@example.com' })
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(200);
          expect(response.text).to.equal('Update successful');
          done();
        });
      });
    });

    describe('With a valid ID and forbidden request in body (NON-admin employee)', () => {
      before( done => {
        let employeeAssigned = new Employee(exampleEmployeeAssigned);

        employeeAssigned.hashPassword(employeeAssigned.password)
        .then(employeeAssigned => employeeAssigned.save())
        .then(employeeAssigned => {
          this.tempEmployeeAssigned = employeeAssigned;
          return employeeAssigned.generateToken();
        })
        .then( tokenEmployeeAssigned => {
          this.tempTokenEmployeeAssigned = tokenEmployeeAssigned;
          done();
        })
        .catch(done);
      });

      after( done => {
        Employee.remove({})
        .then(() => done());
      });

      it('should return a 403 \'forbidden\' error', done => {
        request.put(`${url}/api/employee/${this.tempEmployeeAssigned._id}`)
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeAssigned}`
        })
        .send(updatedEmployeePrivileges)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(403);
          done();
        });
      });
    });

    describe('With an invalid authHeader', () => {
      before( done => {
        let employeeAssigned = new Employee(exampleEmployeeAssigned);

        employeeAssigned.hashPassword(employeeAssigned.password)
        .then(employeeAssigned => employeeAssigned.save())
        .then(employeeAssigned => {
          this.tempEmployeeAssigned = employeeAssigned;
          return employeeAssigned.generateToken();
        })
        .then( tokenEmployeeAssigned => {
          this.tempTokenEmployeeAssigned = tokenEmployeeAssigned;
          done();
        })
        .catch(done);
      });

      after( done => {
        Employee.remove({})
        .then(() => done());
      });

      it('should return a 401 \'unauthorized\' error', done => {
        request.put(`${url}/api/employee/${this.tempEmployeeAssigned._id}`)
        .set({
          Authorization: 'adfdfda'
        })
        .send(updatedEmployeePrivileges)
        .end((err) => {
          expect(err).to.be.an('error');
          expect(err.status).to.equal(401);
          done();
        });
      });
    });

    describe('With an invalid ID but valid body', () => {
      before( done => {
        let employeeUnassigned = new Employee(exampleEmployeeUnassigned);

        employeeUnassigned.hashPassword(employeeUnassigned.password)
        .then(employeeUnassigned => employeeUnassigned.save())
        .then(employeeUnassigned => {
          this.tempEmployeeUnassigned = employeeUnassigned;
          return employeeUnassigned.generateToken();
        })
        .then( tokenEmployeeUnassigned => {
          this.tempTokenEmployeeUnassigned = tokenEmployeeUnassigned;
          done();
        })
        .catch(done);
      });

      it('should return a 404 \'not found\' error', done => {
        request.put(`${url}/api/employee/69538438567u238472`)
        .send({ username: 'updatedinv1', email: 'test55@example.com' })
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeUnassigned}`
        })
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });

    describe('With a valid ID, but invalid auth', () => {
      it('should return a 401 \'unauthorized\' error', done => {
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
      it('should return a 400 \'bad request\' error', done => {
        request.put(`${url}/api/employee/${this.tempEmployeeAdmin._id}`)
        .send('')
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeDefaultUsername}`
        })
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/employee/:employeeID', () => {
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

    before( done => {
      let employeeAssigned = new Employee(exampleEmployeeAssigned);

      employeeAssigned.hashPassword(employeeAssigned.password)
      .then(employeeAssigned => employeeAssigned.save())
      .then(employeeAssigned => {
        this.tempEmployeeAssigned = employeeAssigned;
        return employeeAssigned.generateToken();
      })
      .then( tokenEmployeeAssigned => {
        this.tempTokenEmployeeAssigned = tokenEmployeeAssigned;
        done();
      })
      .catch(done);
    });

    after(done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    before( done => {
      let employeeUnassigned = new Employee(exampleEmployeeUnassigned);

      employeeUnassigned.hashPassword(employeeUnassigned.password)
      .then(employeeUnassigned => employeeUnassigned.save())
      .then(employeeUnassigned => {
        this.tempEmployeeUnassigned = employeeUnassigned;
        return employeeUnassigned.generateToken();
      })
      .then( tokenEmployeeUnassigned => {
        this.tempTokenEmployeeUnassigned = tokenEmployeeUnassigned;
        done();
      })
      .catch(done);
    });

    after(done => {
      Employee.remove({})
      .then(() => done())
      .catch(done);
    });

    describe('With a valid ID and admin status', () => {
      it('should return a 204 status', done => {
        request.delete(`${url}/api/employee/${this.tempEmployeeAdmin._id}`)
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeAdmin}`
        })
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(204);
          done();
        });
      });
    });

    describe('With a valid ID, valid auth, NOT admin', () => {
      it('should return a 403 \'forbidden\' error', done => {
        request.delete(`${url}/api/employee/${this.tempEmployeeAssigned._id}`)
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeAssigned}`
        })
        .end((err, response) => {
          expect(response.status).to.equal(403);
          done();
        });
      });
    });

    describe('With a valid ID and admin status, but bad auth', () => {
      it('should return a 401 \'unauthorized\' error', done => {
        request.delete(`${url}/api/employee/${this.tempEmployeeUnassigned._id}`)
        .end((err, response) => {
          expect(response.status).to.equal(401);
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 \'not found\' error', done => {
        request.delete(`${url}/api/employee/98374ru9248ur293ur92r3`)
        .set({
          Authorization: `Bearer ${this.tempTokenEmployeeUnassigned}`
        })
        .end((err, response) => {
          expect(response.status).to.equal(404);
          done();
        });
      });
    });
  });
});
