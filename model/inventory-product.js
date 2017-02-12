'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventoryProductSchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required:  true },
  category: {type: String, required: true},
  price: {type: Number, required: true},
  quantity: { type: Number, required: true },
  inventoryOrderID: { type: Schema.Types.ObjectId },
  storeID: { type: Schema.Types.ObjectId }
});

module.exports = mongoose.model('inventory', inventoryProductSchema);
