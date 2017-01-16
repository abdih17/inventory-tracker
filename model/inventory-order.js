'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('inventory:inventory order');
const InventoryProduct = require('./inventory-product.js');
const Schema = mongoose.Schema;

const inventoryOrderSchema = Schema({
  inventories: [{type: Schema.Types.ObjectId, ref: 'inventory'}],
  storeID: {type: Schema.Types.ObjectId, required: true},
  test: {type: String }
});

inventoryOrderSchema.pre('remove', function(next) {
  InventoryProduct.remove({inventoryOrderID: this._id}).exec();
  next();
});

const InventoryOrder = module.exports = mongoose.model('inventoryOrder', inventoryOrderSchema);

InventoryOrder.addInventoryProduct = function(id, product) {
  debug('addInventoryProduct');

  return InventoryOrder.findById(id)
  .then(order => {
    product.inventoryOrderID = order._id;
    this.tempOrder = order;
    return new InventoryProduct(product).save();
  })
  .then(product => {
    this.tempOrder.inventories.push(product._id);
    this.tempProduct = product;
    return this.tempOrder.save();
  })
  .then(() => this.tempProduct)
  .catch((err) => {
    if(err.name === 'CastError') return Promise.reject(createError(404, 'not found'));
    return Promise.reject(err);
  });
};

InventoryOrder.removeInventoryProduct = function(id) {
  debug('removeInventoryProduct');

  return InventoryProduct.findById(id)
  .then(product => {
    this.tempProduct = product;
    return InventoryProduct.findByIdAndRemove(product._id);
  })
  .then(() => InventoryOrder.findById(this.tempProduct.inventoryOrderID))
  .then(order => {
    order.inventories.splice(order.inventories.indexOf(this.tempProduct._id), 1);
    return order.save();
  })
  .catch(() => Promise.reject(createError(404, 'not found')));
};
