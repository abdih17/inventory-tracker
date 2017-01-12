'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const Store = require('../model/store.js');
const Customer = require('../model/customer.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleCustomer = {
  name: 'Test name',
  username: 'Test username',
  password: 'Testword',
  email: 'test@test.com',
  address: '12345 nowheresville, test city, test state, 99999'
};

const sampleStore = {
  name: 'Test store name',
  address: 'Test store address',
  storeNumber: '1234'
};

const invalidCustomer = {
  nam: 'Shit turtle',
  username: 'Test username',
  password: 'Testword',
  email: 'test@test.com',
  address: '12345 nowheresville, test city, test state, 99999'
};

const exampleCartOrder = {
  products: []
};

const updatedCustomer = {
  username: 'Usernam',
  name: 'Nam',
  address: 'addnam',
  email: 'nam@nam.nam',
  password: 'newPassword'
};

const noUsernameCustomer = {
  name: 'Name',
  address: 'address',
  email: 'someEmail@mail.com',
  password: 'somePassword'
};

describe('Customer route', function() {
  describe('POST: /api/signup', () => {
    afterEach(done => {
      Promise.all([
        Customer.remove({}),
        Store.remove({})
      ])
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

    describe('With a valid body but no username', () => {
      it('should return a username', done => {
        request
        .post(`${url}/api/signup`)
        .send(noUsernameCustomer)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.body).to.be.a('string');
          expect(response.body).to.equal(noUsernameCustomer.email);
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
      new Store(sampleStore).save()
      .then(store => {
        this.tempStore = store;
        let customer = new Customer(exampleCustomer);

        return customer.hashPassword(customer.password);
      })
      .then(customer => customer.save())
      .then(customer => {
        this.tempCustomer = customer;
        return Customer.addCartOrder(customer._id, this.tempStore._id, exampleCartOrder);
      })
      .then(order => {
        this.tempOrder = order;
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
          expect(response.body.name).to.equal(exampleCustomer.name);
          expect(response.body.email).to.equal(exampleCustomer.email);
          expect(response.body.address).to.equal(exampleCustomer.address);
          expect(response.body.currentOrders.length).to.equal(1);
          expect(response.body.currentOrders[0].customerID).to.equal(this.tempCustomer._id.toString());
          expect(response.body.password).to.equal(undefined);
          expect(response.body.username).to.equal(undefined);
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

    describe('With an invalid username', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .set({
          Authorization: 'false'
        })
        .end((err) => {
          expect(err).to.be.an('error');
          expect(err.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('With an invalid username', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .set({
          Authorization: 'Hello '
        })
        .auth('', 'Testword')
        .end((err) => {
          console.log('***********', err);
          expect(err).to.be.an('error');
          expect(err.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('With an invalid username', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .end((err) => {
          expect(err).to.be.an('error');
          expect(err.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('With an invalid username', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .auth('', 'Testword')
        .end((err) => {
          console.log('***********', err);
          expect(err).to.be.an('error');
          expect(err.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('With an invalid password', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .set({
          Authorization: 'Hello '
        })
        .auth('Tes username', '')
        .end((err) => {
          console.log('***********', err);
          expect(err).to.be.an('error');
          expect(err.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('With an invalid password', () => {
      it('should return a 401 status', done => {
        request
        .get(`${url}/api/signin`)
        .auth('', '')
        .end((err) => {
          console.log('***********', err);
          expect(err).to.be.an('error');
          expect(err.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
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

    describe('With a valid ID, valid auth, but no body', () => {
      it('should return a 400 status', done => {
        request
        .put(`${url}/api/customer/${this.tempCustomer._id}`)
        .auth('Test username', 'Testword')
        .send({})
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/customer/:customerID', () => {
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

    describe('With a valid ID', () => {
      it('should return a 204 status', done => {
        request
        .delete(`${url}/api/customer/${this.tempCustomer._id}`)
        .auth('Test username', 'Testword')
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(204);
          done();
        });
      });
    });

    describe('With a valid ID, but bad auth', () => {
      it('should return a 401 status', done => {
        request
        .delete(`${url}/api/customer/${this.tempCustomer._id}`)
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(401);
          done();
        });
      });
    });

    describe('With an invalid ID', () => {
      it('should return a 404 status', done => {
        request
        .delete(`${url}/api/customer/69`)
        .auth('Test username', 'Testword')
        .end((err, response) => {
          expect(err).to.be.an('error');
          expect(response.status).to.equal(404);
          done();
        });
      });
    });
  });
});
