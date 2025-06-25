const Home = require('../models/Home');
const { handleError, normalizeHomeObject } = require('../utils/controllerUtils');

// Helper to ensure finances object and its arrays exist.
const ensureFinances = (home) => {
    if (!home.finances) {
        home.finances = {};
    }
    if (!home.finances.expectedBills) home.finances.expectedBills = [];
    if (!home.finances.paidBills) home.finances.paidBills = [];
    if (!home.finances.income) home.finances.income = [];
    if (!home.finances.savingsGoals) home.finances.savingsGoals = [];
    if (!home.finances.expenseCategories) home.finances.expenseCategories = [];
};

const addExpectedBill = async (req, res) => {
    try {
        const { homeId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found' });
        ensureFinances(home);
        home.finances.expectedBills.push(req.body);
        await home.save();
        res.status(201).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error adding expected bill');
    }
};

const updateExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const billData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        ensureFinances(home);
        const bill = home.finances.expectedBills.id(billId);
        if (!bill) return res.status(404).json({ message: 'Bill not found.' });
        Object.assign(bill, billData);
        await home.save();
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error updating expected bill');
    }
};

// --- התיקון כאן ---
const deleteExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        // שימוש ב-findByIdAndUpdate עם $pull להסרת החשבון מהמערך
        const updatedHome = await Home.findByIdAndUpdate(
            homeId,
            { $pull: { 'finances.expectedBills': { _id: billId } } },
            { new: true } // החזר את המסמך המעודכן
        );
        if (!updatedHome) return res.status(404).json({ message: 'Home or bill not found.' });
        res.status(200).json(normalizeHomeObject(updatedHome));
    } catch (error) {
        handleError(res, error, 'Error deleting expected bill');
    }
};

// --- והתיקון כאן ---
const payBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        ensureFinances(home);
        const billToPay = home.finances.expectedBills.id(billId);
        if (!billToPay) return res.status(404).json({ message: 'Bill not found in expected bills.' });
        
        const billObject = billToPay.toObject();
        delete billObject._id;
        const paidBillData = { ...billObject, datePaid: new Date() };
        
        // הוסף את החשבון לרשימת המשולמים והסר אותו מרשימת הצפויים בפקודה אחת
        const updatedHome = await Home.findByIdAndUpdate(
            homeId,
            {
                $push: { 'finances.paidBills': paidBillData },
                $pull: { 'finances.expectedBills': { _id: billId } }
            },
            { new: true }
        );

        res.status(200).json(normalizeHomeObject(updatedHome));
    }
    catch (error) {
        handleError(res, error, 'Error paying bill');
    }
};


// --- שאר הפונקציות ללא שינוי ---

const addIncome = async (req, res) => {
    try {
        const { homeId } = req.params;
        const incomeData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        ensureFinances(home);
        home.finances.income.push(incomeData);
        await home.save();
        res.status(201).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error adding income');
    }
};

const addSavingsGoal = async (req, res) => {
    try {
        const { homeId } = req.params;
        const goalData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        ensureFinances(home);
        home.finances.savingsGoals.push(goalData);
        await home.save();
        res.status(201).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error adding savings goal');
    }
};

const addFundsToSavingsGoal = async (req, res) => {
    try {
        const { homeId, goalId } = req.params;
        const { amount } = req.body;
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: 'Valid positive amount is required.' });
        }
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        ensureFinances(home);
        const goal = home.finances.savingsGoals.id(goalId);
        if (!goal) return res.status(404).json({ message: 'Savings goal not found.' });
        goal.currentAmount = (goal.currentAmount || 0) + amount;
        await home.save();
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error adding funds to savings goal');
    }
};

const updateBudgets = async (req, res) => {
    try {
        const { homeId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        ensureFinances(home);
        const updatedCategories = req.body;
        if (!Array.isArray(updatedCategories)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of categories.' });
        }
        home.finances.expenseCategories = updatedCategories;
        await home.save();
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error updating budgets');
    }
};

const getUserMonthlyFinanceSummary = async (req, res) => {
    try {
        const { homeId, year, month } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        const finances = home.finances || {};
        const incomeList = finances.income || [];
        const paidBillsList = finances.paidBills || [];
        const userNames = (home.users || []).map(u => u.name);
        const numericYear = parseInt(year);
        const numericMonth = parseInt(month); 
        const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
        const endOfMonth = new Date(numericYear, numericMonth, 1); 
        const userSummary = {};
        [...userNames, 'משותף'].forEach(user => { userSummary[user] = { income: 0, expenses: 0, net: 0 }; });
        incomeList.forEach(inc => {
            const incomeDate = new Date(inc.date);
            if (incomeDate >= startOfMonth && incomeDate < endOfMonth) {
                const user = inc.assignedTo && userNames.includes(inc.assignedTo) ? inc.assignedTo : 'משותף';
                userSummary[user].income += inc.amount;
            }
        });
        paidBillsList.forEach(bill => {
            const paidDate = new Date(bill.datePaid);
            if (paidDate >= startOfMonth && paidDate < endOfMonth) {
                const user = bill.assignedTo && userNames.includes(bill.assignedTo) ? bill.assignedTo : 'משותף';
                userSummary[user].expenses += bill.amount;
            }
        });
        Object.keys(userSummary).forEach(user => { userSummary[user].net = userSummary[user].income - userSummary[user].expenses; });
        res.status(200).json(userSummary);
    } catch (error) {
        handleError(res, error, 'Error fetching user monthly finance summary');
    }
};

module.exports = {
    addExpectedBill,
    updateExpectedBill,
    deleteExpectedBill,
    payBill,
    addIncome,
    addSavingsGoal,
    addFundsToSavingsGoal,
    updateBudgets,
    getUserMonthlyFinanceSummary,
};