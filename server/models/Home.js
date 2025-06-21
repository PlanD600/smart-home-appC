const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ItemSchema = require('./ItemSchema');
const FinanceSchema = require('./FinanceSchema');

const HomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a home name'],
    unique: true,
  },
  accessCode: {
    type: String,
    required: [true, 'Please provide an access code'],
    minlength: 4,
  },
  currency: {
    type: String,
    // FIX: Changed default currency from "ש"ח" to the correct ISO code "ILS"
    default: 'ILS', 
    required: true,
  },
  users: [{
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  }],
  shoppingList: [ItemSchema],
  tasksList: [ItemSchema], 
  templates: [{
    name: String,
    items: [ItemSchema]
  }],
  finances: {
    type: FinanceSchema,
    default: () => ({})
  }
}, { timestamps: true });

// Hash access code before saving
HomeSchema.pre('save', async function (next) {
  if (!this.isModified('accessCode')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.accessCode = await bcrypt.hash(this.accessCode, salt);
});

// Method to compare entered access code with hashed access code
HomeSchema.methods.compareAccessCode = async function (enteredCode) {
  return await bcrypt.compare(enteredCode, this.accessCode);
};

module.exports = mongoose.model('Home', HomeSchema);