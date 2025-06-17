const Home = require('../models/Home');

// Helper function to find home and handle errors
const findHomeById = async (id, res) => {
  const home = await Home.findById(id);
  if (!home) {
    res.status(404).json({ message: 'Home not found' });
    return null;
  }
  return home;
};

// @desc    Get all homes (for login screen)
// @route   GET /api/homes
exports.getHomes = async (req, res) => {
  try {
    const homes = await Home.find({}, 'name iconClass colorClass');
    res.status(200).json(homes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new home
// @route   POST /api/homes
exports.createHome = async (req, res) => {
  try {
    const { name, accessCode, iconClass } = req.body;
    if (!name || !accessCode) {
      return res.status(400).json({ message: 'Name and access code are required' });
    }
    const newHome = new Home({
      name,
      accessCode,
      iconClass,
      // Add default finance data on creation
      finances: {
        expenseCategories: [
          { name: "דיור", budgetAmount: 0 },
          { name: "מזון ומשקאות", budgetAmount: 0 },
          { name: "חשבונות", budgetAmount: 0 },
        ]
      }
    });
    await newHome.save();
    res.status(201).json(newHome);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get full home data by access code
// @route   POST /api/homes/login
exports.getHomeByAccessCode = async (req, res) => {
  try {
    const { homeId, accessCode } = req.body;
    const home = await Home.findById(homeId);
    if (!home || home.accessCode !== accessCode) {
      return res.status(401).json({ message: 'Invalid access code' });
    }
    res.status(200).json(home);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// --- Item Management (Shopping & Tasks) ---

// @desc    Add an item to a list (shopping or task)
// @route   POST /api/homes/:homeId/:listType
exports.addItem = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const { listType } = req.params;
    const list = listType === 'shopping' ? home.shoppingItems : home.taskItems;
    
    // The request body is the new item
    const newItem = list.create(req.body);
    list.push(newItem);
    
    await home.save();
    // Return the newly created item with its generated _id
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Update an item in a list
// @route   PUT /api/homes/:homeId/:listType/:itemId
exports.updateItem = async (req, res) => {
    try {
        const home = await findHomeById(req.params.homeId, res);
        if (!home) return;

        const { listType, itemId } = req.params;
        const list = listType === 'shopping' ? home.shoppingItems : home.taskItems;
        const item = list.id(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update item fields based on request body
        Object.assign(item, req.body);
        
        await home.save();
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete an item from a list
// @route   DELETE /api/homes/:homeId/:listType/:itemId
exports.deleteItem = async (req, res) => {
    try {
        const home = await findHomeById(req.params.homeId, res);
        if (!home) return;

        const { listType, itemId } = req.params;
        const list = listType === 'shopping' ? home.shoppingItems : home.taskItems;
        
        // Mongoose sub-document removal
        const item = list.id(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        item.remove();
        
        await home.save();
        res.status(200).json({ message: 'Item deleted successfully', itemId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- Finance Management ---

// @desc    Add an expected bill
// @route   POST /api/homes/:homeId/finance/expected-bills
exports.addExpectedBill = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;
    
    const newBill = home.finances.expectedBills.create(req.body);
    home.finances.expectedBills.push(newBill);
    
    await home.save();
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Pay a bill (move from expected to paid and handle recurring)
// @route   POST /api/homes/:homeId/finance/pay-bill/:billId
exports.payBill = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const { billId } = req.params;
    const billToPay = home.finances.expectedBills.id(billId);

    if (!billToPay) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Create a new paid bill entry
    const paidBill = home.finances.paidBills.create({
      text: billToPay.text,
      amount: billToPay.amount,
      datePaid: new Date(),
      category: billToPay.category,
      assignedTo: billToPay.assignedTo,
      comment: billToPay.comment,
    });
    home.finances.paidBills.push(paidBill);

    // If the bill is recurring, create the next instance
    if (billToPay.recurring && billToPay.recurring.frequency) {
      const nextDueDate = new Date(billToPay.dueDate);
      if (billToPay.recurring.frequency === 'monthly') {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      } else if (billToPay.recurring.frequency === 'yearly') {
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      }

      const nextBill = { ...billToPay.toObject(), _id: undefined, dueDate: nextDueDate, isUrgent: false };
      home.finances.expectedBills.push(nextBill);
    }
    
    // Remove the original bill from expectedBills
    billToPay.remove();

    await home.save();
    res.status(200).json(home.finances); // Return the entire updated finances object
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Add an income entry
// @route   POST /api/homes/:homeId/finance/income
exports.addIncome = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const newIncome = home.finances.income.create(req.body);
    home.finances.income.push(newIncome);

    await home.save();
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateBudgets = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const { budgets } = req.body; // Expects an object like { "categoryName": amount }
    
    home.finances.expenseCategories.forEach(cat => {
      if (budgets[cat.name] !== undefined) {
        cat.budgetAmount = parseFloat(budgets[cat.name]) || 0;
      }
    });

    await home.save();
    res.status(200).json(home.finances.expenseCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new savings goal
// @route   POST /api/homes/:homeId/finance/savings-goals
exports.addSavingsGoal = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const newGoal = home.finances.savingsGoals.create(req.body);
    home.finances.savingsGoals.push(newGoal);
    
    await home.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add funds to a savings goal
// @route   PUT /api/homes/:homeId/finance/savings-goals/:goalId
exports.addToSavingsGoal = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;
    
    const goal = home.finances.savingsGoals.id(req.params.goalId);
    if (!goal) {
        return res.status(404).json({ message: 'Savings goal not found' });
    }

    const { amountToAdd } = req.body;
    goal.currentAmount += parseFloat(amountToAdd) || 0;

    await home.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// You can add more controllers for savings, budgets, etc., following the same pattern.
// --- TODO: Add controllers for Finance, Users, Templates etc. ---
// I'll add more controllers here as we proceed to the frontend implementation
// to keep this response focused. The structure will be similar.