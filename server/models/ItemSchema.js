const mongoose = require('mongoose');

// This schema can be nested recursively to support sub-items/sub-tasks.
const ItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Item text cannot be empty.'],
    trim: true, // Removes whitespace from both ends of a string
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
    default: 'משותף', // "Shared"
  },
  createdBy: {
    type: String,
    required: [true, 'The creator of the item must be specified.'],
  },
  comment: {
    type: String,
    default: '',
    trim: true,
  },

// This field will store where the item came from when it's archived.
  // It can be null for active items.
  originalList: {
    type: String,
    enum: ['shopping', 'tasks', null], // Can be one of these or not exist
    default: null,
  },

  // Using timestamps option instead of a manual createdAt field
  subItems: [this], // Recursive nesting of items
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = ItemSchema;
