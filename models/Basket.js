
const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema({
  household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Basket', basketSchema);
