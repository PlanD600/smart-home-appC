const mongoose = require('mongoose');

/**
 * @file ItemSchema
 * @description Defines the schema for sub-documents like shopping items and tasks.
 * Used within the main Home schema.
 */
const ItemSchema = new mongoose.Schema({
  // FIX: The 'id' field was removed. MongoDB automatically provides a unique '_id' for each sub-document,
  // making a separate, manually-managed 'id' field redundant and prone to validation errors.
  // The client-side code should use the '_id' field for all operations.
  
  text: {
    type: String,
    required: [true, 'Item text cannot be empty.'],
    trim: true,
  },
  category: {
    type: String,
    default: 'כללית',
    trim: true,
  },
  completed: { // For tasks and shopping items (isPurchased)
    type: Boolean,
    default: false,
  },
  isUrgent: { // For priority
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
  // Fields specific to tasks
  dueDate: {
    type: Date,
  },
  // Fields specific to shopping items
  isPurchased: { // A more descriptive name for shopping items
      type: Boolean,
      default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Note: This schema is not exported as a model on its own.
// It's intended to be embedded in other schemas, like Home.js.
module.exports = ItemSchema;

