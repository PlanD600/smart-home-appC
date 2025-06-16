const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema({
    income: [{
        text: String,
        amount: Number,
        date: String,
        recurring: { frequency: String }, // 'monthly', 'yearly'
        assignedTo: String,
        comment: String,
    }],
    expectedBills: [{
        text: String,
        amount: Number,
        dueDate: String,
        category: String,
        isUrgent: Boolean,
        recurring: { frequency: String },
        assignedTo: String,
        comment: String,
    }],
    paidBills: [{
        text: String,
        amount: Number,
        datePaid: String,
        category: String,
        assignedTo: String,
        comment: String,
    }],
    expenseCategories: [{
        name: String,
        icon: String,
        color: String,
        budgetAmount: Number,
    }],
    savingsGoals: [{
        name: String,
        targetAmount: Number,
        currentAmount: Number,
    }],
    financeSettings: {
        currency: { type: String, default: 'ש"ח' },
    },
});

module.exports = FinanceSchema;