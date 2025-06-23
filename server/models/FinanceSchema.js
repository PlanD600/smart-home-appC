const mongoose = require('mongoose');

// --- Sub-schemas for better structure and validation ---

const IncomeSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    source: { type: String, trim: true },
    assignedTo: String,
    isRecurring: { type: Boolean, default: false },
}, { timestamps: true });

const BillSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    dueDate: { type: Date, required: true },
    isUrgent: { type: Boolean, default: false },
    assignedTo: String,
    recurring: { 
        isRecurring: { type: Boolean, default: false },
        frequency: { type: String, enum: ['monthly', 'bimonthly', 'quarterly', 'annually', 'no'], default: 'no' }
    },
}, { timestamps: true });

const PaidBillSchema = new mongoose.Schema({
    ...BillSchema.obj, // Inherit all fields from BillSchema
    datePaid: { type: Date, default: Date.now },
}, { timestamps: true });

const SavingsGoalSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
}, { timestamps: true });

const ExpenseCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: String,
    color: String,
    budgetAmount: { type: Number, default: 0 },
});

// --- Main Finance Schema ---

const FinanceSchema = new mongoose.Schema({
  income: [IncomeSchema],
  expectedBills: [BillSchema],
  paidBills: [PaidBillSchema],
  expenseCategories: [ExpenseCategorySchema],
  savingsGoals: [SavingsGoalSchema],
  financeSettings: {
    currency: { type: String, default: 'ILS', required: true },
  },
});

module.exports = FinanceSchema;
