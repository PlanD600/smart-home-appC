const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    text: { type: String, required: true }, // השדה צריך להיות 'text'
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    category: { type: String, required: true },
    recurring: {
        isRecurring: { type: Boolean, default: false },
        frequency: { type: String, default: 'no' }
    },
    assignedTo: { type: String, default: 'משותף' } 
}, { timestamps: true });

const PaidBillSchema = new mongoose.Schema({
    text: { type: String, required: true }, // גם כאן השדה צריך להיות 'text'
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    datePaid: { type: Date, required: true },
    category: { type: String, required: true },
    assignedTo: { type: String, default: 'משותף' }
}, { timestamps: true });

// ... שאר הקובץ ללא שינוי ...
const IncomeSchema = new mongoose.Schema({
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
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