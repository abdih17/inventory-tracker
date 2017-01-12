'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('inventory:store');
const createError = require('http-errors');
const Promise = require('bluebird');
const InventoryOrder = require('./inventory-order.js');
const InventoryProduct = require('./inventory-product.js');
const Schema = mongoose.Schema;

const storeSchema = Schema({
  name: {
    type: String,
    required: true
  },
  storeNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  employees: [
    {
      type: Schema.Types.ObjectId,
      ref: 'employee'
    }
  ],
  incoming: [
    {
      type: Schema.Types.ObjectId,
      ref:'inventoryOrder'
    }
  ],
  outgoing: [
    {
      type: Schema.Types.ObjectId,
      ref: 'cartOrder'
    }
  ],
  current: [
    {
      type: Schema.Types.ObjectId,
      ref: 'inventory'
    }
  ]
});


const Store = module.exports = mongoose.model('store', storeSchema);

Store.findByIdAndAddEmployee = function(id, employee) {
  debug('findByIdAndAddEmployee');

  return Store.findById(id)
  .then(store => {
    this.tempStore = store;
    employee.storeID = store._id;
    return employee.save();
  })
  .then(employee => {
    this.tempStore.employees.push(employee._id);
    this.tempEmployee = employee;
    return this.tempStore.save();
  })
  .then(() => Promise.resolve(this.tempEmployee))
  .catch(() => Promise.reject(createError(400, 'Bad request.')));
};


Store.completeInventoryOrder = function(id, inventory) {
  debug('completeInventoryOrder');

  return Store.findById(id)
  .then( store => {
    this.tempStore = store;
    inventory.storeID = store._id;
    return new InventoryProduct(inventory).save();
  })
  .then(product => {
    this.tempStore.current.push(product._id);
    this.tempProduct = product;
    return this.tempStore.save();
  })
  .then(() => this.tempProduct)
  .catch( () => Promise.reject(createError(404, 'store not found')));
};


Store.addInventoryOrder = function(id, inventory) {
  debug('addInventoryOrder');

  return Store.findById(id)
  .catch( err => Promise.reject(createError(404, err.message)))
  .then( store => {
    inventory.storeID = store._id;
    this.tempStore = store;
    return new InventoryOrder(inventory).save();
  })
  .then( inventory => {
    this.tempStore.incoming.push(inventory._id);
    this.tempInventoryOrder = inventory;
    return this.tempStore.save();
  })
  .then( () => {
    return this.tempInventoryOrder;
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};

Store.removeInventoryOrder = function(id) {
  debug('removeInventoryOrder');

  return InventoryOrder.findById(id)
  .then(order => {
    this.tempInventoryOrder = order;
    return InventoryOrder.findByIdAndRemove(order._id);
  })
  .then(() => Store.findById(this.tempInventoryOrder.storeID))
  .then(store => {
    store.incoming.splice(store.incoming.indexOf(this.tempInventoryOrder._id), 1);
    store.save();
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};
