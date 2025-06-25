const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ItemSchema = require('./ItemSchema');
const { FinanceSchema } = require('./FinanceSchema'); // ייבוא נכון של FinanceSchema

const HomeSchema = new mongoose.Schema({
  // --- התיקון המרכזי כאן ---
  name: {
    type: String,
    required: [true, 'Please provide a home name'],
    unique: true,
    trim: true,
  },
  accessCode: {
    type: String,
    required: [true, 'Please provide an access code'],
    minlength: 4,
  },
  iconClass: {
    type: String,
    default: 'fas fa-home',
  },
  colorClass: {
    type: String,
    default: 'card-color-1',
  },
  users: [{
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  }],
  shoppingList: [ItemSchema],
  tasksList: [ItemSchema],
  archivedItems: [ItemSchema],
  listCategories: {
    type: [String],
    default: ['כללית', 'מצרכים', 'ירקות ופירות', 'מוצרי חלב', 'מטלות בית', 'סידורים']
  },
  templates: [{
    name: String,
    type: { type: String, enum: ['shopping', 'tasks'] }, // התיקון השני: הסרת 'finance'
    items: [ItemSchema]
  }],
  finances: {
    type: FinanceSchema,
    default: () => ({}),
  }
}, { timestamps: true });

// Middleware to hash the access code before saving
HomeSchema.pre('save', async function (next) {
  if (!this.isModified('accessCode')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.accessCode = await bcrypt.hash(this.accessCode, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered access code with the hashed one
HomeSchema.methods.compareAccessCode = async function (enteredCode) {
  return await bcrypt.compare(enteredCode, this.accessCode);
};

module.exports = mongoose.model('Home', HomeSchema);