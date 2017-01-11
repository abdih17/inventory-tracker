'use strict';

const mongoose = require('mongoose');
const CartProduct = require('./cart.js');
const createError = require('http-errors');
const debug = require('debug')('inventory:cart order');
const Schema = mongoose.Schema;

const cartOrderSchema = Schema({
  shippingAddress: {type: String, required: true},
  shippingName: {type: String, required: true},
  customerID: {type: Schema.Types.ObjectId, required: true},
  // TODO: Uncomment this line when the store is completed.
  // storeID: {type: Schema.Types.ObjectId, required: true},
  products: [{type: Schema.Types.ObjectId, ref: 'cartProduct'}]
});

const CartOrder = module.exports = mongoose.model('cartOrder', cartOrderSchema);

CartOrder.addCartProduct = function(id, product) {
  debug('addCartProduct');

  return CartOrder.findById(id)
  .then(order => {
    product.cartOrderID = order._id;
    this.tempOrder = order;
    return new CartProduct(product).save();
  })
  .then(product => {
    this.tempOrder.products.push(product._id);
    this.tempProduct = product;
    return this.tempOrder.save();
  })
  .then(() => this.tempProduct)
  .catch(err => Promise.reject(createError(404, err.message)));
};

CartOrder.removeCartProduct = function(id) {
  debug('removeCartProduct');

  return CartProduct.findById(id)
  .then(product => {
    this.tempProduct = product;
    return CartProduct.findByIdAndRemove(product._id);
  })
  .then(() => CartOrder.findById(this.tempProduct.cartOrderID))
  .then(order => {
    order.products.splice(order.products.indexOf(this.tempProduct._id), 1);
    order.save();
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};
