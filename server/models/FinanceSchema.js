const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    category: { type: String, required: true },
    isRecurring: { type: Boolean, default: false },
    assignedTo: { type: String, default: 'משותף' } 
}, { timestamps: true });

const PaidBillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    datePaid: { type: Date, required: true },
    category: { type: String, required: true },
    assignedTo: { type: String, default: 'משותף' }
}, { timestamps: true });

const IncomeSchema = new mongoose.Schema({
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    // [NEW] Added field to assign income to a specific user
    assignedTo: { type: String } 
}, { timestamps: true });

const SavingsGoalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date }
}, { timestamps: true });

const FinanceSchema = new mongoose.Schema({
    expectedBills: [BillSchema],
    paidBills: [PaidBillSchema],
    income: [IncomeSchema],
    savingsGoals: [SavingsGoalSchema],
    expenseCategories: [{
        name: String,
        budgetAmount: Number,
        icon: String,
        color: String
    }]
}, { _id: false });

module.exports = {
    FinanceSchema,
    BillSchema,
    IncomeSchema,
    SavingsGoalSchema
};