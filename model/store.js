'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('inventory:store');
const createError = require('http-errors');
const Promise = require('bluebird');
const InventoryOrder = require('./inventory-order.js');
const InventoryProduct = require('./inventory-product.js');
const CartOrder = require('./cart-order.js');
const Employee = require('./employee.js');
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

storeSchema.pre('remove', function(next) {
  CartOrder.remove({storeID: this._id}).exec();
  Employee.remove({storeID: this._id}).exec();
  InventoryOrder.remove({storeID: this._id}).exec();
  InventoryProduct.remove({storeID: this._id}).exec();
  next();
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

Store.completeInventoryOrder = function(id) {
  debug('completeInventoryOrder');

  return InventoryOrder.findById(id)
  .then(order => {
    if (!order) return Promise.reject(404, 'Inventory order not found.');
    this.tempOrder = order;
    return Store.findById(order.storeID);
  })
  .then(store => {
    this.tempStore = store;
    return InventoryProduct.findById(this.tempOrder.inventories[0]);
  })
  .then(inventoryOrderProduct => {
    this.tempProduct = inventoryOrderProduct;
    return InventoryProduct.findOne({name: inventoryOrderProduct.name, desc: inventoryOrderProduct.desc, storeID: this.tempStore._id});
  })
  .then(product => {
    if (!product) {
      this.tempProduct.storeID = this.tempStore._id;
      this.tempStore.current.push(this.tempProduct);
      return this.tempProduct.save();
    }
    product.quantity += this.tempProduct.quantity;
    return product.save();
  })
  .then(() => this.tempStore.save())
  .then(() => {
    this.tempOrder.inventories.splice(0, 1);
    if (this.tempOrder.inventories.length === 0) return Store.removeInventoryOrder(this.tempOrder._id);
    this.tempOrder.save()
    .then(order => Store.completeInventoryOrder(order._id))
    .catch(err => Promise.reject(err));
  })
  .catch(err => Promise.reject(createError(404, err.message)));
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
    return order.remove({_id: order._id});
  })
  .then(() => Store.findById(this.tempInventoryOrder.storeID))
  .then(store => {
    store.incoming.splice(store.incoming.indexOf(this.tempInventoryOrder._id), 1);
    store.save();
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};
