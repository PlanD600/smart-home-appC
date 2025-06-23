const Home = require('../models/Home');
const { handleError, normalizeHomeObject } = require('../utils/controllerUtils');

// --- Bill Management ---

/**
 * Adds a new expected bill to the home's finances.
 */
const addExpectedBill = async (req, res) => {
    try {
        const { homeId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found' });

        const newBill = home.finances.expectedBills.create(req.body);
        home.finances.expectedBills.push(newBill);
        await home.save();
        
        // Return only the newly created bill
        res.status(201).json(newBill);
    } catch (error) {
        handleError(res, error, 'Error adding expected bill');
    }
};

/**
 * Updates an existing expected bill.
 */
const updateExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const billData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const bill = home.finances.expectedBills.id(billId);
        if (!bill) return res.status(404).json({ message: 'Bill not found.' });

        Object.assign(bill, billData);
        await home.save();
        
        res.status(200).json(bill);
    } catch (error) {
        handleError(res, error, 'Error updating expected bill');
    }
};

/**
 * Deletes an expected bill.
 */
const deleteExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params; 
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const bill = home.finances.expectedBills.id(billId);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found.' });
        }
        
        bill.remove();
        await home.save();
        
        res.status(200).json({ message: 'Bill deleted successfully.' });
    } catch (error) {
        handleError(res, error, 'Error deleting expected bill');
    }
};

/**
 * Marks an expected bill as paid, moving it to the paidBills array.
 */
const payBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const billToPay = home.finances.expectedBills.id(billId);
        if (!billToPay) return res.status(404).json({ message: 'Bill not found in expected bills.' });

        const paidBillData = { ...billToPay.toObject(), datePaid: new Date() };
        home.finances.paidBills.push(paidBillData);
        
        billToPay.remove(); // Remove from expectedBills

        await home.save();
        
        // Return the whole updated finances object as both lists were changed
        res.status(200).json(normalizeHomeObject(home).finances);
    }
    catch (error) {
        handleError(res, error, 'Error paying bill');
    }
};


// --- Income Management ---

/**
 * Adds a new income record.
 */
const addIncome = async (req, res) => {
    try {
        const { homeId } = req.params;
        const incomeData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const newIncome = home.finances.income.create(incomeData);
        home.finances.income.push(newIncome);
        await home.save();
        
        res.status(201).json(newIncome);
    } catch (error) {
        handleError(res, error, 'Error adding income');
    }
};

// --- Savings Goal Management ---

/**
 * Adds a new savings goal.
 */
const addSavingsGoal = async (req, res) => {
    try {
        const { homeId } = req.params;
        const goalData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const newGoal = home.finances.savingsGoals.create(goalData);
        home.finances.savingsGoals.push(newGoal);
        await home.save();
        
        res.status(201).json(newGoal);
    } catch (error) {
        handleError(res, error, 'Error adding savings goal');
    }
};

/**
 * Adds funds to an existing savings goal.
 */
const addFundsToSavingsGoal = async (req, res) => {
    try {
        const { homeId, goalId } = req.params;
        const { amount } = req.body;
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: 'Valid positive amount is required.' });
        }

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const goal = home.finances.savingsGoals.id(goalId);
        if (!goal) return res.status(404).json({ message: 'Savings goal not found.' });

        goal.currentAmount = (goal.currentAmount || 0) + amount;
        await home.save();
        
        res.status(200).json(goal);
    } catch (error) {
        handleError(res, error, 'Error adding funds to savings goal');
    }
};

// --- Budget Management ---

/**
 * Updates the budget for expense categories.
 */
const updateBudgets = async (req, res) => {
    try {
        const { homeId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const updatedCategories = req.body;
        if (!Array.isArray(updatedCategories)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of categories.' });
        }

        home.finances.expenseCategories = updatedCategories;
        await home.save();
        
        res.status(200).json(home.finances.expenseCategories);
    } catch (error) {
        handleError(res, error, 'Error updating budgets');
    }
};

// --- Financial Summary ---

/**
 * Gets a monthly financial summary broken down by user.
 */
const getUserMonthlyFinanceSummary = async (req, res) => {
    try {
        const { homeId, year, month } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const numericYear = parseInt(year);
        const numericMonth = parseInt(month); 

        const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
        const endOfMonth = new Date(numericYear, numericMonth, 1); 

        const userNames = (home.users || []).map(u => u.name);
        const userSummary = {};

        // Initialize summary for all registered users and a "Shared" category
        [...userNames, 'משותף'].forEach(user => {
            userSummary[user] = { income: 0, expenses: 0, net: 0 };
        });

        home.finances.income.forEach(inc => {
            const incomeDate = new Date(inc.date);
            if (incomeDate >= startOfMonth && incomeDate < endOfMonth) {
                const user = inc.assignedTo && userNames.includes(inc.assignedTo) ? inc.assignedTo : 'משותף';
                userSummary[user].income += inc.amount;
            }
        });

        home.finances.paidBills.forEach(bill => {
            const paidDate = new Date(bill.datePaid);
            if (paidDate >= startOfMonth && paidDate < endOfMonth) {
                const user = bill.assignedTo && userNames.includes(bill.assignedTo) ? bill.assignedTo : 'משותף';
                userSummary[user].expenses += bill.amount;
            }
        });

        Object.keys(userSummary).forEach(user => {
            userSummary[user].net = userSummary[user].income - userSummary[user].expenses;
        });

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
