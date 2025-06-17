// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/models/Home.js
const mongoose = require('mongoose');
const ItemSchema = require('./ItemSchema.js');
const FinanceSchema = require('./FinanceSchema.js');

const HomeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    accessCode: { type: String, required: false }, // Making it optional for simplicity
    iconClass: { type: String, default: 'fas fa-home' },
    colorClass: { type: String, default: 'card-color-1' },
    users: { type: [String], default: ['Admin'] }, // Default user "Admin"

    // Using imported schemas
    shoppingItems: { type: [ItemSchema], default: [] },
    taskItems: { type: [ItemSchema], default: [] },
    archivedShopping: { type: [ItemSchema], default: [] },
    archivedTasks: { type: [ItemSchema], default: [] },
    
    // Using the dedicated Finance schema
    finances: {
        type: FinanceSchema,
        default: () => ({ // Default to an object with basic finance structure
            income: [],
            expectedBills: [],
            paidBills: [],
            expenseCategories: [
                { name: "דיור", budgetAmount: 0 },
                { name: "מזון ומשקאות", budgetAmount: 0 },
                { name: "חשבונות", budgetAmount: 0 },
            ],
            savingsGoals: [],
            financeSettings: { currency: '₪' }
        })
    },

    // Simple arrays for category names
    shoppingCategories: { type: [String], default: ['כללית'] },
    taskCategories: { type: [String], default: ['כללית'] },

    // Templates remain flexible
    templates: {
        type: [{
            name: String,
            type: String, // 'shopping', 'task', 'finance'
            items: mongoose.Schema.Types.Mixed,
        }],
        default: []
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Home', HomeSchema);