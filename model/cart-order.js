'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('inventory:cart order');
const CartProduct = require('./cart-product.js');
const InventoryProduct = require('./inventory-product.js');
const Schema = mongoose.Schema;

const cartOrderSchema = Schema({
  shippingAddress: {type: String, required: true},
  shippingName: {type: String, required: true},
  customerID: {type: Schema.Types.ObjectId, required: true},
  storeID: {type: Schema.Types.ObjectId, required: true},
  products: [{type: Schema.Types.ObjectId, ref: 'cartProduct'}]
});

cartOrderSchema.pre('remove', function(next) {
  CartProduct.remove({cartOrderID: this._id}).exec();
  next();
});

const CartOrder = module.exports = mongoose.model('cartOrder', cartOrderSchema);

CartOrder.addCartProduct = function(cartOrderID, storeID, product) {
  debug('addCartProduct');

  product.storeID = storeID;
  console.log('PRODUCT PASSED IN IS', product);
  return InventoryProduct.findOne({
    name: product.name,
    desc: product.desc,
    storeID: storeID
  })
  .then(invProduct => {
    console.log('INVPRODUCT IS', invProduct);
    if (invProduct.quantity < product.quantity) return Promise.reject(createError(400, 'Store does not have that much inventory'));
    if (invProduct.quantity === 0) return Promise.reject(createError(400, 'Store is out of that product'));

    invProduct.quantity -= product.quantity;
    return invProduct.save();
  })
  .then(() => CartOrder.findById(cartOrderID))
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
