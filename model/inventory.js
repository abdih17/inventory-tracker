'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const InventoryOrder = require('./inventory-order.js');

const inventoryProductSchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required:  true },
  quantity: { type: Number, required: true },
  inventoryOrderID: { type: Schema.Types.ObjectId },
  storeID: { type: Schema.Types.ObjectId, ref: 'store' }
});

module.exports = mongoose.model('inventory', inventoryProductSchema);
