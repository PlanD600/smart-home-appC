const mongoose = require('mongoose');

// הגדרת ItemSchema מחוץ לפונקציה כדי לאפשר רקורסיה
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
  // === הוספה: תמיכה בתתי-פריטים / תתי-מטלות ===
  // זה מאפשר למטלות להיות מקוננות, כלומר, פריט יכול להכיל רשימה של פריטים אחרים.
  subItems: {
    type: [this], // יצירת מערך של ItemSchema (רקורסיבי)
    default: [],
  },
  // ==========================================
});

module.exports = ItemSchema;
