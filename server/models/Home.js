const mongoose = require('mongoose');
const { Schema } = mongoose;

// ייבוא סכמות משנה עבור פריטים פיננסיים, מטלות וקניות
const FinanceSchema = require('./FinanceSchema');
const ItemSchema = require('./ItemSchema'); // ישמש עבור shoppingItems ו-taskItems

// הגדרת סכמה לתבנית (Template)
const TemplateItemSchema = new Schema({
  text: { type: String, required: true },
  amount: { type: Number }, // רלוונטי לתבניות פיננסיות
  date: { type: String }, // רלוונטי לתבניות פיננסיות (ISO string)
}, { _id: false }); // לא ליצור _id עבור פריטים בתבנית

const TemplateSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['shopping', 'task', 'finance'], required: true },
  items: [TemplateItemSchema], // מערך של פריטים בתבנית
}, { _id: false });

// הגדרת הסכמה הראשית עבור הבית (Home)
const HomeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  accessCode: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    default: 'fas fa-home',
  },
  colorClass: {
    type: String,
    default: 'card-color-1',
  },
  members: { // משתמשים המשויכים לבית (יכולים להיות IDs של משתמשים מאומתים)
    type: [String],
    default: [],
  },
  users: { // שמות בני הבית לשיבוץ פריטים (כמו "אני", "משותף", "הורה 1")
    type: [String],
    default: ["אני"],
  },
  shoppingItems: [ItemSchema], // רשימת פריטי קניות
  taskItems: [ItemSchema], // רשימת מטלות
  shoppingCategories: { // קטגוריות מותאמות אישית לרשימת קניות
    type: [String],
    default: ["כללית"],
  },
  taskCategories: { // קטגוריות מותאמות אישית לרשימת מטלות
    type: [String],
    default: ["כללית"],
  },
  templates: [TemplateSchema], // רשימת תבניות (קניות, מטלות, פיננסים)
  archivedShopping: [ItemSchema], // פריטי קניות בארכיון
  archivedTasks: [ItemSchema], // מטלות בארכיון
  finances: FinanceSchema, // אובייקט ניהול כספים משולב
}, { timestamps: true }); // הוספת timestamps אוטומטיים (createdAt, updatedAt)

const Home = mongoose.model('Home', HomeSchema);

module.exports = Home;
