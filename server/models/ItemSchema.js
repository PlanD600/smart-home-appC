const mongoose = require('mongoose');
const { Schema } = mongoose;

// סכמה עבור פריט כללי (קניות או מטלות)
const ItemSchema = new Schema({
  id: { type: String, required: true }, // ID ייחודי בצד לקוח (לדוגמה: Date.now())
  text: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'כללית',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  isUrgent: { // עבור דחיפות / חשיבות (כמו כוכב)
    type: Boolean,
    default: false,
  },
  assignedTo: { // למי הפריט משויך
    type: String,
    default: 'משותף',
  },
  comment: { // הערה לפריט
    type: String,
  },
}, { _id: false }); // לא ליצור _id עבור פריטים אלה, מכיוון שהם משובצים במערכים ב-HomeSchema

module.exports = ItemSchema;
