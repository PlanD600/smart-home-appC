const mongoose = require('mongoose');
const ItemSchema = require('./ItemSchema');
const FinanceSchema = require('./FinanceSchema');

const HomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Home name is required'],
    trim: true,
  },
  accessCode: {
    type: String,
    required: [true, 'Access code is required'],
  },
  iconClass: {
    type: String,
    default: 'fas fa-home',
  },
  colorClass: {
    type: String,
    default: 'card-color-1',
  },
  users: {
    type: [String],
    default: ['אני'],
  },
  shoppingCategories: {
    type: [String],
    default: ['כללית'],
  },
  taskCategories: {
    type: [String],
    default: ['כללית'],
  },
  shoppingItems: [ItemSchema],
  taskItems: [ItemSchema],
  archivedShopping: [ItemSchema],
  archivedTasks: [ItemSchema],
  templates: [
    {
      name: String,
      type: String, // 'shopping', 'task', 'finance'
      items: mongoose.Schema.Types.Mixed,
    },
  ],
  finances: FinanceSchema,
});

module.exports = mongoose.model('Home', HomeSchema);