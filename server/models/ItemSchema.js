const mongoose = require('mongoose');

const SubItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
});

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    subItems: [SubItemSchema] // Nested sub-items
});

module.exports = ItemSchema;
