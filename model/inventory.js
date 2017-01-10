'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required:  true },
  quantity: { type: Number, required: true },
  inventoryOrder: { Schema.Types.ObjectId },
  storyID: { Schema.Types.ObjectId, ref: store }
});

module.exports = mongoose.model('inventory', inventorySchema);
