'use strict';

'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const InventoryProduct = require('./inventory.js');
const debug = require('debug')('inventory:inventory order');
const Schema = mongoose.Schema;

const inventoryOrderSchema = Schema({
  inventories: [{type: Schema.Types.ObjectId, ref: 'inventoryProduct'}],
  storeID: {type: Schema.Types.ObjectId, required: true}
});

const InventoryOrder = module.exports = mongoose.model('inventoryOrder', inventoryOrderSchema);

InventoryOrder.addInventoryProduct = function(id, product) {
  debug('addInventoryProduct');

  return new Promise((resolve, reject) => {
    InventoryOrder.findById(id)
    .then(order => {

      if(!order) return reject('Inventory order not found.');

      product.inventoryOrderID = order._id;
      this.tempOrder = order;
      return new InventoryProduct(product).save();
    })
    .then(product => {
      console.log(this.tempOrder);
      this.tempOrder.inventories.push(product._id);
      this.tempProduct = product;
      return this.tempOrder.save();
    })
    .then(() => resolve(this.tempProduct));
  });
};

InventoryOrder.removeInventoryProduct = function(id) {
  debug('removeInventoryProduct');

  return new Promise((resolve, reject) => {
    InventoryProduct.findById(id)
    .then(product => {

      if(!product) return reject('Inventory product not found');

      this.tempProduct = product;
      return InventoryProduct.findByIdAndRemove(product._id);
    })
    .then(() => InventoryOrder.findById(this.tempProduct.inventoryOrderID))
    .then(order => {

      if(!order) return reject('Order not found.');

      order.inventories.splice(order.inventories.indexOf(this.tempProduct._id), 1);
      return order.save();
    })
    .then(() => resolve());
  });
};
