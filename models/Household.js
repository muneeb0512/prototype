const mongoose = require('mongoose');

const HouseholdSchema = new mongoose.Schema(
  {
    household_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  
);

module.exports = mongoose.model('Household', HouseholdSchema);


