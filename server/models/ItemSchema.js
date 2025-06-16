// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/models/ItemSchema.js
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
}, { _id: true }); // Ensure sub-items get their own _id

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    isUrgent: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        default: 'כללית'
    },
    assignedTo: {
        type: String,
        default: 'משותף'
    },
    comment: {
        type: String,
        default: ''
    },
    subItems: [SubItemSchema] // Nested sub-items
}, { timestamps: true });

module.exports = ItemSchema;