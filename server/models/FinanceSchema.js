const mongoose = require('mongoose');
const { Schema } = mongoose;

// סכמת משנה לפריט הכנסה בודד
const IncomeItemSchema = new Schema({
  id: { type: String, required: true }, // ID ייחודי בצד לקוח
  text: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // תאריך בפורמט ISO string
  assignedTo: { type: String, default: 'משותף' },
  comment: { type: String },
  recurring: { // אובייקט עבור הכנסה קבועה
    frequency: { type: String, enum: ['monthly', 'yearly'] },
  },
}, { _id: false });

// סכמת משנה לחשבון צפוי בודד
const ExpectedBillSchema = new Schema({
  id: { type: String, required: true }, // ID ייחודי בצד לקוח
  text: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: String, required: true }, // תאריך יעד בפורמט ISO string
  category: { type: String, default: 'כללית' },
  isUrgent: { type: Boolean, default: false },
  assignedTo: { type: String, default: 'משותף' },
  comment: { type: String },
  recurring: { // אובייקט עבור חיוב קבוע
    frequency: { type: String, enum: ['monthly', 'yearly'] },
  },
}, { _id: false });

// סכמת משנה לחשבון ששולם בודד
const PaidBillSchema = new Schema({
  id: { type: String, required: true }, // ID ייחודי בצד לקוח
  text: { type: String, required: true },
  amount: { type: Number, required: true },
  datePaid: { type: String, required: true }, // תאריך תשלום בפורמט ISO string
  category: { type: String, default: 'כללית' },
  assignedTo: { type: String, default: 'משותף' },
  comment: { type: String },
}, { _id: false });

// סכמת משנה לקטגוריית הוצאה בודדת
const ExpenseCategorySchema = new Schema({
  id: { type: String, required: true }, // ID ייחודי בצד לקוח
  name: { type: String, required: true },
  icon: { type: String }, // לדוגמה 'fas fa-home'
  color: { type: String }, // קוד צבע הקסה
  budgetAmount: { type: Number, default: 0 }, // סכום תקציב חודשי לקטגוריה
}, { _id: false });

// סכמת משנה ליעד חיסכון בודד
const SavingsGoalSchema = new Schema({
  id: { type: String, required: true }, // ID ייחודי בצד לקוח
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
}, { _id: false });

// סכמה ראשית לנתונים פיננסיים
const FinanceSchema = new Schema({
  income: [IncomeItemSchema], // מערך של הכנסות
  expectedBills: [ExpectedBillSchema], // מערך של חשבונות צפויים
  paidBills: [PaidBillSchema], // מערך של חשבונות ששולמו
  expenseCategories: [ExpenseCategorySchema], // מערך של קטגוריות הוצאה עם תקציבים
  savingsGoals: [SavingsGoalSchema], // מערך של יעדי חיסכון
  financeSettings: { // הגדרות פיננסיות כלליות (כמו מטבע)
    currency: { type: String, default: '₪' },
  },
}, { _id: false }); // לא ליצור _id עבור הסכמה הפיננסית עצמה, מכיוון שהיא משובצת ב-HomeSchema

module.exports = FinanceSchema;
