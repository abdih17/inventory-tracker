'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const Customer = require('../model/customer.js');
const CartOrder = require('../model/cart-order.js');
const CartProduct = require('../model/cart.js');

require('../server.js');

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

const sampleProduct = {
  name: 'Test product',
  desc: 'Test description',
  quantity: 100
};

describe('Cart Product Routes', function() {
  after(done => {
    Promise.all([
      Customer.remove({}),
      CartOrder.remove({}),
      CartProduct.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/orders/:cartOrderID/cart', () => {
    before(done => {
      new Customer(sampleCustomer).save()
      .then(customer => {
        this.tempCustomer = customer;
        sampleOrder.customerID = customer._id;
        return Customer.addCartOrder(customer._id, sampleOrder);
      })
      .then(order => {
        this.tempOrder = order;
        sampleProduct.orderID = order._id;
        done();
      })
      .catch(done);
    });

    describe('With a valid ID and body', () => {
      it('should return a product', done => {
        request
        .post(`${url}/api/orders/${this.tempOrder._id}/cart`)
        .send(sampleProduct)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.status).to.equal(201);
          expect(response.body.name).to.equal(sampleProduct.name);
          expect(response.body.desc).to.equal(sampleProduct.desc);
          expect(response.body.quantity).to.equal(sampleProduct.quantity);
          expect(response.body.cartOrderID).to.equal(this.tempOrder._id.toString());
          done();
        });
      });
    });
  });
});
