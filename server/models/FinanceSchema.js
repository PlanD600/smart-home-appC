const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema({
  // הכנסות
  income: [
    {
      text: String,
      amount: Number,
      date: Date,
      recurring: { frequency: String }, // 'monthly', 'yearly'
      assignedTo: String,
      comment: String,
    },
  ],
  // חשבונות שטרם שולמו
  expectedBills: [
    {
      text: String,
      amount: Number,
      dueDate: Date,
      category: String,
      isUrgent: { type: Boolean, default: false },
      recurring: { frequency: String }, // 'monthly', 'yearly'
      assignedTo: String,
      comment: String,
    },
  ],
  // חשבונות ששולמו
  paidBills: [
    {
      text: String,
      amount: Number,
      datePaid: Date,
      category: String,
      assignedTo: String,
      comment: String,
    },
  ],
  // קטגוריות הוצאה ותקציב
  expenseCategories: [
    {
      name: String,
      icon: String,
      color: String,
      budgetAmount: { type: Number, default: 0 },
    },
  ],
  // יעדי חיסכון
  savingsGoals: [
    {
      name: String,
      targetAmount: Number,
      currentAmount: { type: Number, default: 0 },
    },
  ],
  // הגדרות כלליות
  financeSettings: {
    currency: { type: String, default: 'ש"ח' },
  },
});

module.exports = FinanceSchema;