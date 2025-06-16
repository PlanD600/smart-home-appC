// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/models/FinanceSchema.js
const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
    text: String,
    amount: Number,
    date: Date,
    recurring: { frequency: String }, // 'monthly', 'yearly'
    assignedTo: String,
    comment: String,
});

const BillSchema = new mongoose.Schema({
    text: String,
    amount: Number,
    dueDate: Date,
    category: String,
    isUrgent: Boolean,
    recurring: { frequency: String },
    assignedTo: String,
    comment: String,
});

const PaidBillSchema = new mongoose.Schema({
    text: String,
    amount: Number,
    datePaid: Date,
    category: String,
    assignedTo: String,
    comment: String,
});

const ExpenseCategorySchema = new mongoose.Schema({
    name: String,
    icon: String,
    color: String,
    budgetAmount: { type: Number, default: 0 },
});

const SavingsGoalSchema = new mongoose.Schema({
    name: String,
    targetAmount: Number,
    currentAmount: { type: Number, default: 0 },
});

const FinanceSchema = new mongoose.Schema({
    income: [IncomeSchema],
    expectedBills: [BillSchema],
    paidBills: [PaidBillSchema],
    expenseCategories: [ExpenseCategorySchema],
    savingsGoals: [SavingsGoalSchema],
    financeSettings: {
        currency: { type: String, default: '₪' },
    },
}, { _id: false }); // No separate _id for the finance object itself

module.exports = FinanceSchema;