const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Item text is required'],
  },
  category: {
    type: String,
    default: 'כללית',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: String,
    default: 'משותף',
  },
  comment: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = ItemSchema;