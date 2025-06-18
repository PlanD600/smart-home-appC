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
exports.getHomes = async (req, res) => {
  try {
    const homes = await Home.find({}, 'name iconClass colorClass');
    res.status(200).json(homes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new home
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
      users: ['אני'], 
      finances: {
        income: [],
        expectedBills: [],
        paidBills: [],
        savingsGoals: [],
        expenseCategories: [
          { name: "דיור ושכירות", budgetAmount: 0, color: "#AED581" },
          { name: "מזון ומשקאות", budgetAmount: 0, color: "#FFB74D" },
          { name: "חשבונות ותקשורת", budgetAmount: 0, color: "#4FC3F7" },
          { name: "תחבורה ורכב", budgetAmount: 0, color: "#BA68C8" },
          { name: "בילוי ופנאי", budgetAmount: 0, color: "#F06292" },
          { name: "ביגוד והנעלה", budgetAmount: 0, color: "#4DB6AC" },
          { name: "בריאות וטיפוח", budgetAmount: 0, color: "#FF8A65" },
          { name: "חינוך וילדים", budgetAmount: 0, color: "#7986CB" },
          { name: "מתנות ותרומות", budgetAmount: 0, color: "#E57373" },
          { name: "שונות", budgetAmount: 0, color: "#90A4AE" }
        ],
        financeSettings: { currency: "ש\"ח" }
      }
    });
    await newHome.save();
    res.status(201).json(newHome);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get full home data by access code
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

// --- Item Management ---
exports.addItem = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;
    const { listType } = req.params;
    const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
    const newItem = home[listKey].create(req.body);
    home[listKey].push(newItem);
    await home.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateItem = async (req, res) => {
    try {
        const home = await findHomeById(req.params.homeId, res);
        if (!home) return;
        const { listType, itemId } = req.params;
        const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
        const item = home[listKey].id(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        Object.assign(item, req.body);
        await home.save();
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const home = await findHomeById(req.params.homeId, res);
        if (!home) return;
        const { listType, itemId } = req.params;
        const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
        home[listKey].pull({ _id: itemId });
        await home.save();
        res.status(200).json({ message: 'Item deleted successfully', itemId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- Finance Management ---
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

exports.payBill = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;
    const { billId } = req.params;
    const billToPay = home.finances.expectedBills.id(billId);
    if (!billToPay) return res.status(404).json({ message: 'Bill not found' });
    const paidBill = { text: billToPay.text, amount: billToPay.amount, datePaid: new Date(), category: billToPay.category, assignedTo: billToPay.assignedTo, comment: billToPay.comment };
    home.finances.paidBills.push(paidBill);
    if (billToPay.recurring && billToPay.recurring.frequency) {
      const nextDueDate = new Date(billToPay.dueDate);
      if (billToPay.recurring.frequency === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      else if (billToPay.recurring.frequency === 'yearly') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      const nextBill = { ...billToPay.toObject(), _id: undefined, dueDate: nextDueDate, isUrgent: false };
      home.finances.expectedBills.push(nextBill);
    }
    home.finances.expectedBills.pull({ _id: billId });
    await home.save();
    res.status(200).json(home.finances);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.deleteExpectedBill = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;
    home.finances.expectedBills.pull({ _id: req.params.billId });
    await home.save();
    res.status(200).json({ message: 'Bill deleted successfully', billId: req.params.billId });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateExpectedBill = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;
    const bill = home.finances.expectedBills.id(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    Object.assign(bill, req.body);
    await home.save();
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update budget categories for a home
exports.updateBudgets = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const updatedCategories = req.body; // Expecting an array of category objects from the frontend

    home.finances.expenseCategories = []; // Clear the array
    updatedCategories.forEach(cat => {
      home.finances.expenseCategories.push({
        name: cat.name,
        budgetAmount: parseFloat(cat.budgetAmount) || 0,
        color: cat.color || '#cccccc', // Ensure color exists or use default
      });
    });
    
    await home.save();
    res.status(200).json(home.finances.expenseCategories);
  } catch (error) {
    console.error("Error in updateBudgets:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

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

exports.addToSavingsGoal = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;
    const goal = home.finances.savingsGoals.id(req.params.goalId);
    if (!goal) return res.status(404).json({ message: 'Savings goal not found' });
    const { amountToAdd } = req.body;
    goal.currentAmount += parseFloat(amountToAdd) || 0;
    await home.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

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

// @desc    Add a user to a home's user list
exports.addUser = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'שם משתמש נדרש' });
    }
    if (!home.users) {
      home.users = [];
    }

    const normalizedName = name.trim();
    if (home.users.includes(normalizedName)) {
      return res.status(400).json({ message: `המשתמש ${normalizedName} כבר קיים` });
    }
    
    home.users.push(normalizedName);
    await home.save();
    res.status(201).json(home.users);
    
  } catch (error) {
    console.error("Error in addUser controller:", error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

// @desc    Remove a user from a home's user list
exports.removeUser = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const userNameToRemove = req.params.userName;
    
    if (!home.users.includes(userNameToRemove)) {
      return res.status(404).json({ message: `המשתמש ${userNameToRemove} לא נמצא בבית זה.` });
    }

    // Remove user from the users array
    home.users = home.users.filter(user => user !== userNameToRemove);

    // --- Reset assignedTo for items/finances associated with the removed user ---
    const defaultAssigned = 'משותף'; // Or any other default string

    // Shopping Items
    home.shoppingItems.forEach(item => {
      if (item.assignedTo === userNameToRemove) {
        item.assignedTo = defaultAssigned;
      }
    });

    // Task Items
    home.taskItems.forEach(item => {
      if (item.assignedTo === userNameToRemove) {
        item.assignedTo = defaultAssigned;
      }
    });

    // Expected Bills
    home.finances.expectedBills.forEach(bill => {
      if (bill.assignedTo === userNameToRemove) {
        bill.assignedTo = defaultAssigned;
      }
    });

    // Paid Bills
    home.finances.paidBills.forEach(bill => {
      if (bill.assignedTo === userNameToRemove) {
        bill.assignedTo = defaultAssigned;
      }
    });

    // Income
    home.finances.income.forEach(inc => {
      if (inc.assignedTo === userNameToRemove) {
        inc.assignedTo = defaultAssigned;
      }
    });
    // --- End of assignedTo reset ---

    await home.save();
    res.status(200).json({ message: `המשתמש ${userNameToRemove} הוסר בהצלחה.`, users: home.users });
    
  } catch (error) {
    console.error("Error in removeUser controller:", error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

// @desc    Get user's monthly finance summary (income vs. expenses)
// @route   GET /api/home/:homeId/finances/user-summary/:year/:month
// @access  Private (needs auth later)
exports.getUserMonthlyFinanceSummary = async (req, res) => {
  try {
    const home = await findHomeById(req.params.homeId, res);
    if (!home) return;

    const { year, month } = req.params; // month is 0-indexed in JS Dates, but often 1-indexed in routes
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1)); // Adjust to 0-indexed month and UTC
    const endOfMonth = new Date(Date.UTC(year, month - 1, 1));
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1); // Go to next month
    endOfMonth.setUTCDate(0); // Set to last day of previous month

    const userSummary = {};

    // Initialize all users from home.users to ensure they appear in the summary
    home.users.forEach(user => {
      userSummary[user] = { income: 0, expenses: 0, net: 0 };
    });

    // Aggregate paid bills (expenses)
    home.finances.paidBills.forEach(bill => {
      const billDate = new Date(bill.datePaid);
      if (billDate >= startOfMonth && billDate <= endOfMonth) {
        const assignedTo = bill.assignedTo || 'משותף';
        if (!userSummary[assignedTo]) { // Handle cases where assignedTo might be a new user not in home.users yet
          userSummary[assignedTo] = { income: 0, expenses: 0, net: 0 };
        }
        userSummary[assignedTo].expenses += bill.amount;
      }
    });

    // Aggregate income
    home.finances.income.forEach(inc => {
      const incomeDate = new Date(inc.date);
      if (incomeDate >= startOfMonth && incomeDate <= endOfMonth) {
        const assignedTo = inc.assignedTo || 'משותף';
         if (!userSummary[assignedTo]) { // Handle cases where assignedTo might be a new user not in home.users yet
          userSummary[assignedTo] = { income: 0, expenses: 0, net: 0 };
        }
        userSummary[assignedTo].income += inc.amount;
      }
    });

    // Calculate net for each user
    Object.keys(userSummary).forEach(user => {
      userSummary[user].net = userSummary[user].income - userSummary[user].expenses;
    });

    res.status(200).json(userSummary);

  } catch (error) {
    console.error("Error in getUserMonthlyFinanceSummary controller:", error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};