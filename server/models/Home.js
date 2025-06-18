const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // נדרש לגיבוב קוד הגישה ולאבטחה
const ItemSchema = require('./ItemSchema');
const FinanceSchema = require('./FinanceSchema');

const HomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Home name is required'],
    trim: true,
    unique: true, // הוסף unique לוודא ששם הבית ייחודי
  },
  accessCode: {
    type: String,
    required: [true, 'Access code is required'],
  },
  iconClass: {
    type: String,
    default: 'fas fa-home',
  },
  colorClass: {
    type: String,
    default: 'card-color-1',
  },
  users: {
    type: [String],
    default: ['אני'],
  },
  // שדות shoppingCategories ו-taskCategories הוסרו כי הם לא בשימוש
  
  // שינוי שם מ-shoppingItems ל-shoppingList
  shoppingList: [ItemSchema], 
  // שינוי שם מ-taskItems ל-tasks
  tasks: [ItemSchema], 
  // שינוי שמות שדות הארכיון לעקביות
  archivedShoppingList: [ItemSchema],
  archivedTasksList: [ItemSchema],
  templates: [
    {
      name: String,
      type: String, // 'shopping', 'task', 'finance'
      items: mongoose.Schema.Types.Mixed, // או סכימה מפורטת יותר אם יש מבנה קבוע
    },
  ],
  finances: FinanceSchema,
}, { timestamps: true }); // הוספת timestamps לשדות createdAt ו-updatedAt אוטומטית

// Middleware - גיבוב קוד הגישה לפני שמירה
HomeSchema.pre('save', async function(next) {
  if (this.isModified('accessCode')) {
    // רק אם קוד הגישה השתנה או נוצר, בצע גיבוב
    this.accessCode = await bcrypt.hash(this.accessCode, 10);
  }
  next();
});

// שיטה להשוואת קוד הגישה
HomeSchema.methods.compareAccessCode = async function(candidateAccessCode) {
  return await bcrypt.compare(candidateAccessCode, this.accessCode);
};

module.exports = mongoose.model('Home', HomeSchema);