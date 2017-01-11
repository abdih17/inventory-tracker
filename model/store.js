'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('inventory:store');
const createError = require('http-errors');
const Promise = require('bluebird');
const InventoryOrder = require('./inventory-order.js')
const Schema = mongoose.Schema;
const Employee = require('../model/employee.js');

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
    required: true
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
  .catch( err => Promise.reject(createError(404, err.message)))
  .then( store => {
    employee.storeID = store._id;
    this.tempStore = store;
    return new Employee(employee).save();
  })
  .then( employee => {
    this.tempStore.employees.push(employee._id);
    this.tempEmployee = employee;
    return this.tempStore.save();
  })
  .then( () => {
    return this.tempEmployee;
  });
};

// Store.findByIdAndAddToIncoming = function(id, inventory) {
//   debug('findByIdAndAddToIncoming');
//
//   return Store.findById(id)
//   .catch( err => Promise.reject(createError(404, err.message)))
//   .then( store => {
//     inventory.storeID = store._id;
//     this.tempStore = store;
//     return new inventory(inventory).save();
//   })
//   .then( inventory => {
//     this.tempStore.incoming.push(inventory._id);
//     this.tempInventory = inventory;
//     return this.tempStore.save();
//   })
//   .then( () => {
//     return this.tempInventory;
//   });
// };

Store.addInventoryProduct = function(id, inventory) {
  debug('addInventoryProduct');

  return Store.findById(id)
  .catch( err => Promise.reject(createError(404, err.message)))
  .then( store => {
    inventory.storeID = store._id;
    this.tempStore = store;
    return new InventoryOrder(inventory).save();
  })
  .then( inventory => {
    this.tempStore.incoming.push(inventory._id);
    this.tempInventory = inventory;
    return this.tempStore.save();
  })
  .then( () => {
    return this.tempInventoryOrder;
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};

// Store.findByIdAndAddToCurrent = function(id, inventoryOrder) {
//   debug('findByIdAndAddToCurrent');
//
//   return Store.findById(id)
//   .catch( err => Promise.reject(createError(404, err.message)))
//   .then( store => {
//     inventoryOrder.storeID = store._id;
//     this.tempStore = store;
//     return new inventoryOrder(inventoryOrder).save();
//   })
//   .then( inventoryOrder => {
//     this.tempStore.current.push(inventoryOrder._id);
//     this.tempInventoryOrder = inventoryOrder;
//     return this.tempStore.save();
//   })
//   .then( () => {
//     return this.tempInventoryOrder;
//   });
// };

Store.removeInventoryOrder = function(id) {
  debug('removeInventoryOrder');

  return InventoryOrder.findById(id)
  .then(order => {
    this.tempInventoryOrder = order;
    return InventoryOrder.findByIdAndRemove(order._id);
  })
  .then(() => Store.findById(this.tempInventoryOrder.storeID))
  .then(store => {
    store.currentOrders.splice(store.currentOrders.indexOf(this.tempInventoryOrder._id), 1);
    store.save();
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};
