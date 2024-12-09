
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
});

module.exports = mongoose.model('User', userSchema);
