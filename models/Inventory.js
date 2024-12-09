// models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  item_id: { type: Number, unique: true },
  name: { type: String, required: true },
  description: String,
  quantity: Number,
  price: Number,
});

module.exports = mongoose.model('Inventory', inventorySchema);
