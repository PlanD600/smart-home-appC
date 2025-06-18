const Home = require('../models/Home');

// Helper function to handle common error responses
const handleError = (res, error, defaultMessage = 'An error occurred', statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({ message: error.message || defaultMessage });
};

// Get all homes (for login screen)
exports.getHomes = async (req, res) => {
    try {
        const homes = await Home.find().select('_id name iconClass colorScheme');
        res.status(200).json(homes);
    } catch (error) {
        handleError(res, error, 'Error fetching homes');
    }
};

// NEW: Get home by ID (for fetching full details)
exports.getHomeById = async (req, res) => {
    try {
        const { homeId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }
        res.status(200).json(home);
    } catch (error) {
        handleError(res, error, 'Error fetching home details', 400);
    }
};

// Create a new home
exports.createHome = async (req, res) => {
    try {
        const { name, accessCode, iconClass, colorScheme } = req.body;
        if (!name || !accessCode) {
            return res.status(400).json({ message: 'Name and access code are required.' });
        }

        const newHome = new Home({
            name,
            accessCode,
            iconClass: iconClass || 'fas fa-home',
            colorScheme: colorScheme || 'card-color-1',
            users: [], // Initialize with an empty users array
            shoppingItems: [],
            taskItems: [],
            finances: {
                income: [],
                expectedBills: [],
                paidBills: [],
                savingsGoals: [],
                expenseCategories: [],
            },
            templates: [],
            archivedItems: [],
        });

        await newHome.save();
        res.status(201).json({ message: 'Home created successfully', homeId: newHome._id });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Home with this name already exists. Please choose a different name.' });
        }
        handleError(res, error, 'Error creating home');
    }
};

// Login to an existing home
exports.loginHome = async (req, res) => {
    try {
        const { homeId, accessCode } = req.body;
        const home = await Home.findById(homeId);

        if (!home || home.accessCode !== accessCode) {
            return res.status(401).json({ message: 'Invalid Home ID or Access Code.' });
        }

        // Return the full home object upon successful login
        res.status(200).json(home);
    } catch (error) {
        handleError(res, error, 'Error logging in', 400);
    }
};

// Add item to shopping or tasks list
exports.addItem = async (req, res) => {
    try {
        const { homeId, listType } = req.params;
        const { text, category, assignedTo, completed, isUrgent, comment } = req.body; // Added 'comment'

        if (!text) {
            return res.status(400).json({ message: 'Item text is required.' });
        }
        if (!['shopping', 'tasks'].includes(listType)) {
            return res.status(400).json({ message: 'Invalid list type.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        const newItem = {
            text,
            category: category || 'כללית',
            assignedTo: assignedTo || 'משותף',
            completed: completed || false,
            isUrgent: isUrgent || false,
            comment: comment || '' // Initialize comment
        };

        if (listType === 'shopping') {
            home.shoppingItems.push(newItem);
        } else {
            home.taskItems.push(newItem);
        }

        await home.save();
        res.status(201).json(newItem);
    } catch (error) {
        handleError(res, error, 'Error adding item');
    }
};

// Update an item in shopping or tasks list
exports.updateItem = async (req, res) => {
    try {
        const { homeId, listType, itemId } = req.params;
        const updateData = req.body;

        if (!['shopping', 'tasks'].includes(listType)) {
            return res.status(400).json({ message: 'Invalid list type.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        const items = home[listType + 'Items'];
        const itemIndex = items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        // Update specific fields of the item
        Object.keys(updateData).forEach(key => {
            items[itemIndex][key] = updateData[key];
        });

        await home.save();
        res.status(200).json(items[itemIndex]);
    } catch (error) {
        handleError(res, error, 'Error updating item');
    }
};

// Delete an item from shopping or tasks list
exports.deleteItem = async (req, res) => {
    try {
        const { homeId, listType, itemId } = req.params;

        if (!['shopping', 'tasks'].includes(listType)) {
            return res.status(400).json({ message: 'Invalid list type.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        // Filter out the item to be deleted
        home[listType + 'Items'] = home[listType + 'Items'].filter(item => item._id.toString() !== itemId);

        await home.save();
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        handleError(res, error, 'Error deleting item');
    }
};


// User Management
exports.addUserToHome = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'User name is required.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        if (home.users.includes(name)) {
            return res.status(409).json({ message: 'User with this name already exists in this home.' });
        }

        home.users.push(name);
        await home.save();
        res.status(200).json(home.users); // Return the updated list of users
    } catch (error) {
        handleError(res, error, 'Error adding user to home');
    }
};

exports.removeUserFromHome = async (req, res) => {
    try {
        const { homeId, userName } = req.params;

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        const initialUserCount = home.users.length;
        home.users = home.users.filter(user => user !== userName);

        if (home.users.length === initialUserCount) {
            return res.status(404).json({ message: 'User not found in this home.' });
        }

        await home.save();
        res.status(200).json({ message: 'User removed successfully', users: home.users }); // Return updated users
    } catch (error) {
        handleError(res, error, 'Error removing user from home');
    }
};


// Finance Management
exports.addExpectedBill = async (req, res) => {
    try {
        const { homeId } = req.params;
        const billData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.expectedBills.push(billData);
        await home.save();
        res.status(201).json(billData);
    } catch (error) {
        handleError(res, error, 'Error adding expected bill');
    }
};

exports.updateExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const billData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const billIndex = home.finances.expectedBills.findIndex(bill => bill._id.toString() === billId);
        if (billIndex === -1) return res.status(404).json({ message: 'Bill not found.' });

        Object.assign(home.finances.expectedBills[billIndex], billData);
        await home.save();
        res.status(200).json(home.finances.expectedBills[billIndex]);
    } catch (error) {
        handleError(res, error, 'Error updating expected bill');
    }
};

exports.deleteExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.expectedBills = home.finances.expectedBills.filter(bill => bill._id.toString() !== billId);
        await home.save();
        res.status(200).json({ message: 'Bill deleted successfully.' });
    } catch (error) {
        handleError(res, error, 'Error deleting expected bill');
    }
};

exports.payBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const billIndex = home.finances.expectedBills.findIndex(bill => bill._id.toString() === billId);
        if (billIndex === -1) return res.status(404).json({ message: 'Bill not found in expected bills.' });

        const paidBill = { ...home.finances.expectedBills[billIndex], paidAt: new Date() };
        home.finances.paidBills.push(paidBill);
        home.finances.expectedBills.splice(billIndex, 1); // Remove from expected

        await home.save();
        res.status(200).json(home.finances); // Return updated finances object
    } catch (error) {
        handleError(res, error, 'Error paying bill');
    }
};

exports.addIncome = async (req, res) => {
    try {
        const { homeId } = req.params;
        const incomeData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.income.push(incomeData);
        await home.save();
        res.status(201).json(incomeData);
    } catch (error) {
        handleError(res, error, 'Error adding income');
    }
};

exports.addSavingsGoal = async (req, res) => {
    try {
        const { homeId } = req.params;
        const goalData = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.savingsGoals.push(goalData);
        await home.save();
        res.status(201).json(goalData);
    } catch (error) {
        handleError(res, error, 'Error adding savings goal');
    }
};

exports.addFundsToSavingsGoal = async (req, res) => {
    try {
        const { homeId, goalId } = req.params;
        const { amount } = req.body;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const goal = home.finances.savingsGoals.id(goalId);
        if (!goal) return res.status(404).json({ message: 'Savings goal not found.' });

        goal.currentAmount += amount;
        await home.save();
        res.status(200).json(goal);
    } catch (error) {
        handleError(res, error, 'Error adding funds to savings goal');
    }
};

exports.updateBudgets = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { expenseCategories } = req.body; // Expecting an array of categories
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.expenseCategories = expenseCategories; // Replace existing categories
        await home.save();
        res.status(200).json(home.finances.expenseCategories);
    } catch (error) {
        handleError(res, error, 'Error updating budgets');
    }
};

exports.getUserMonthlyFinanceSummary = async (req, res) => {
    try {
        const { homeId, year, month } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const numericYear = parseInt(year);
        const numericMonth = parseInt(month); // 1-12 for month

        const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
        const endOfMonth = new Date(numericYear, numericMonth, 0); // Last day of the month

        const monthlyIncome = home.finances.income.filter(inc => {
            const incomeDate = new Date(inc.date);
            return incomeDate >= startOfMonth && incomeDate <= endOfMonth;
        });

        const monthlyPaidBills = home.finances.paidBills.filter(bill => {
            const paidDate = new Date(bill.paidAt);
            return paidDate >= startOfMonth && paidDate <= endOfMonth;
        });

        // Sum amounts
        const totalIncome = monthlyIncome.reduce((sum, inc) => sum + inc.amount, 0);
        const totalExpenses = monthlyPaidBills.reduce((sum, bill) => sum + bill.amount, 0);

        res.status(200).json({ totalIncome, totalExpenses, monthlyIncome, monthlyPaidBills });

    } catch (error) {
        handleError(res, error, 'Error fetching user monthly finance summary');
    }
};

// Gemini AI Integration
exports.transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText } = req.body;
        // In a real application, you'd send `recipeText` to a Gemini AI service
        // and receive a structured shopping list. For now, a mock response.
        
        // Mock response:
        const mockShoppingList = [
            { text: "חלב", category: "מוצרי חלב" },
            { text: "ביצים", category: "מוצרי יסוד" },
            { text: "קמח", category: "אפייה" },
        ];

        // You would then save these items to the home's shopping list
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        mockShoppingList.forEach(item => home.shoppingItems.push(item));
        await home.save();

        res.status(200).json({ message: "Recipe transformed and items added to shopping list!", newItems: mockShoppingList });
    } catch (error) {
        handleError(res, error, 'Error transforming recipe with Gemini');
    }
};

exports.breakdownComplexTask = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { taskText } = req.body;
        // In a real application, you'd send `taskText` to a Gemini AI service
        // and receive a structured breakdown of sub-tasks. For now, a mock response.

        // Mock response:
        const mockSubTasks = [
            { text: `תת-משימה 1 מתוך "${taskText}"`, category: "תת-משימה" },
            { text: `תת-משימה 2 מתוך "${taskText}"`, category: "תת-משימה" },
        ];

        // You would then save these sub-tasks to the home's tasks list
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        mockSubTasks.forEach(item => home.taskItems.push(item));
        await home.save();

        res.status(200).json({ message: "Task broken down and sub-tasks added!", newItems: mockSubTasks });
    } catch (error) {
        handleError(res, error, 'Error breaking down task with Gemini');
    }
};