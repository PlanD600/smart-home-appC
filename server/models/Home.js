const mongoose = require('mongoose');
const ItemSchema = require('./ItemSchema'); // ייבוא סכמת הפריטים
const FinanceSchema = require('./FinanceSchema'); // ייבוא סכמת הכספים

const HomeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    accessCode: { type: String, required: true },
    iconClass: { type: String, default: 'fas fa-home' },
    colorClass: { type: String, default: 'card-color-1' },
    users: [String],

    // שימוש בסכמות שיובאו
    shoppingItems: [ItemSchema],
    taskItems: [ItemSchema],
    finances: FinanceSchema,

    // שדות פשוטים נשארים כאן
    shoppingCategories: [String],
    taskCategories: [String],
    archivedShopping: [ItemSchema], // גם הארכיון משתמש באותו מבנה פריט
    archivedTasks: [ItemSchema],
    templates: [{
        name: String,
        type: String, // 'shopping', 'task', 'finance'
        items: mongoose.Schema.Types.Mixed, // Allows for flexible template items
    }],
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Home', HomeSchema);