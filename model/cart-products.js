'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartProductSchema = Schema({
  name: {type: String, required: true},
  desc: {type: String, required: true},
  quantity: {type: Number, required: true},
  cartOrderID: {type: Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('cartProduct', cartProductSchema);
