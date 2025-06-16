// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/models/Home.js
const mongoose = require('mongoose');
const ItemSchema = require('./ItemSchema.js');
const FinanceSchema = require('./FinanceSchema.js');

const HomeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    accessCode: { type: String, required: false }, // Making it optional for simplicity
    iconClass: { type: String, default: 'fas fa-home' },
    colorClass: { type: String, default: 'card-color-1' },
    users: [String],

    // Using imported schemas
    shoppingItems: [ItemSchema],
    taskItems: [ItemSchema],
    archivedShopping: [ItemSchema],
    archivedTasks: [ItemSchema],
    
    // Using the dedicated Finance schema
    finances: {
        type: FinanceSchema,
        default: () => ({}) // Default to an empty object
    },

    // Simple arrays for category names
    shoppingCategories: [String],
    taskCategories: [String],

    // Templates remain flexible
    templates: [{
        name: String,
        type: String, // 'shopping', 'task', 'finance'
        items: mongoose.Schema.Types.Mixed,
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Home', HomeSchema);