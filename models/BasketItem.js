
const mongoose = require('mongoose');

const basketItemSchema = new mongoose.Schema({
  basket: { type: mongoose.Schema.Types.ObjectId, ref: 'Basket', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true },
  added_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BasketItem', basketItemSchema);