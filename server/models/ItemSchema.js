const mongoose = require('mongoose');

// סכמה עבור תת-פריט
// SubItemSchema
const SubItemSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

// סכמה עבור פריט ראשי
// ItemSchema
const ItemSchema = new mongoose.Schema({
    text: { type: String, required: true },
    category: { type: String, default: 'כללית' },
    completed: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    assignedTo: { type: String, default: 'משותף' },
    comment: { type: String, default: '' },
    subItems: [SubItemSchema] // הוספת מערך של תת-פריטים
}, {
    timestamps: true, // הוספת חותמת זמן ליצירה ועדכון של הפריט הראשי
});

module.exports = ItemSchema;