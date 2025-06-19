const Home = require('../models/Home');

// --- פונקציות עזר ---

const handleError = (res, error, defaultMessage = 'An error occurred', statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({ message: error.message || defaultMessage });
};

// "מנרמלת" את אובייקט הבית כדי להבטיח מבנה נתונים אחיד ונכון לקליינט
const normalizeHomeObject = (home) => {
    if (!home) return null;

    const homeObject = home.toObject ? home.toObject() : home;

    homeObject.users = homeObject.users || [];
    homeObject.shoppingList = homeObject.shoppingList || [];
    homeObject.tasks = homeObject.tasks || [];
    homeObject.templates = homeObject.templates || [];

    homeObject.finances = homeObject.finances || {};
    const finances = homeObject.finances;

    finances.expectedBills = finances.expectedBills || [];
    finances.paidBills = finances.paidBills || [];
    finances.income = finances.income || [];
    finances.savingsGoals = finances.savingsGoals || [];

    // **תיקון לוגיקה קריטי**: מוודאים ש-expenseCategories הוא תמיד מערך של אובייקטים
    let categories = finances.expenseCategories || [];
    
    // אם הנתונים ב-DB הם בטעות אובייקט, נמיר אותם למערך
    if (!Array.isArray(categories)) {
        categories = Object.entries(categories).map(([name, data]) => ({
            name: name,
            budgetAmount: (typeof data === 'number' ? data : data.budgetAmount) || 0,
            color: data.color || '#cccccc'
        }));
    }
    
    // אם המערך ריק, ניצור קטגוריות ברירת מחדל
    if (categories.length === 0) {
        categories = [
            { name: 'Groceries', budgetAmount: 0, color: '#FFD700' },
            { name: 'Utilities', budgetAmount: 0, color: '#87CEEB' },
            { name: 'Rent', budgetAmount: 0, color: '#FFA07A' },
            { name: 'Entertainment', budgetAmount: 0, color: '#98FB98' },
            { name: 'Other', budgetAmount: 0, color: '#D3D3D3' },
        ];
    }

     const homeFinances = { ...finances };
        homeFinances.expenseCategories = defaultExpenseCategories;

    return homeObject;
};

// --- פונקציות ה-Controller ---

// קבל את כל הבתים (למסך הלוגין)
const getHomes = async (req, res) => {
    try {
        const homes = await Home.find({}, '_id name iconClass colorScheme');
        res.status(200).json(homes);
    } catch (error) {
        handleError(res, error, 'Error fetching homes');
    }
};

// קבל פרטים מלאים של בית יחיד
const getHomeDetails = async (req, res) => {
    try {
        const { homeId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }
        const normalizedHome = normalizeHomeObject(home);
        res.status(200).json(normalizedHome);
    } catch (error) {
        handleError(res, error, 'Error fetching home details', 400);
    }
};

// התחברות לבית ספציפי
const loginToHome = async (req, res) => {
    try {
        const { homeId, accessCode } = req.body;
        const home = await Home.findById(homeId);

        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        const isMatch = await home.compareAccessCode(accessCode);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid access code' });
        }

        const normalizedHome = normalizeHomeObject(home);
        res.status(200).json(normalizedHome);
    } catch (error) {
        handleError(res, error, 'Server error during login', 500);
    }
};

// פונקציה ליצירת בית חדש - עם אתחול מלא
const createHome = async (req, res) => {
    const { name, accessCode } = req.body;
  
    if (!name || !accessCode) {
      return res.status(400).json({ message: 'Name and access code are required' });
    }
  
    try {
      const newHome = new Home({
        name,
        accessCode,
        users: [],
        shoppingList: [],
        tasks: [],
        templates: [], 
        finances: {
          expectedBills: [],
          paidBills: [],
          income: [],
          savingsGoals: [],
          expenseCategories: { // אתחול כאובייקט
            'Groceries': 0, 'Utilities': 0, 'Rent': 0, 'Entertainment': 0, 'Other': 0
          }
        }
      });
  
      await newHome.save();
      res.status(201).json(normalizeHomeObject(newHome));
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'A home with this name already exists.' });
      }
      handleError(res, error, 'Server error creating home');
    }
};

// הוספת פריט (קניות או משימות)
const addItem = async (req, res) => {
    try {
        const { homeId, listType } = req.params;
        const { text, category, assignedTo, completed, isUrgent, comment } = req.body; 

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
            comment: comment || ''
        };
        
        const listField = listType === 'shopping' ? 'shoppingList' : 'tasks';
        home[listField].push(newItem);
        
        await home.save();
        res.status(201).json(home[listField][home[listField].length - 1]);
    } catch (error) {
        handleError(res, error, 'Error adding item');
    }
};

// עדכון פריט
const updateItem = async (req, res) => {
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

        const listField = listType === 'shopping' ? 'shoppingList' : 'tasks';
        const item = home[listField].id(itemId); 

        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        Object.assign(item, updateData);
        await home.save();
        res.status(200).json(item);
    } catch (error) {
        handleError(res, error, 'Error updating item');
    }
};

// מחיקת פריט
const deleteItem = async (req, res) => {
    try {
        const { homeId, listType, itemId } = req.params;

        if (!['shopping', 'tasks'].includes(listType)) {
            return res.status(400).json({ message: 'Invalid list type.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        const listField = listType === 'shopping' ? 'shoppingList' : 'tasks';
        home[listField].pull({ _id: itemId });
        
        await home.save();
        res.status(204).send(); 
    } catch (error) {
        handleError(res, error, 'Error deleting item');
    }
};

// ניהול משתמשים
const addUser = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { userName } = req.body; 
        if (!userName) {
            return res.status(400).json({ message: 'User name is required.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        if (home.users.includes(userName)) {
            return res.status(409).json({ message: 'User with this name already exists in this home.' });
        }

        home.users.push(userName);
        await home.save();
        res.status(201).json(home.users); 
    } catch (error) {
        handleError(res, error, 'Error adding user to home');
    }
};

const removeUser = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { userName } = req.body; 

        const home = await Home.findOneAndUpdate(
            { _id: homeId },
            { $pull: { users: userName } }, 
            { new: true } 
        );

        if (!home) return res.status(404).json({ message: 'Home not found.' });

        if (home.users.includes(userName)) { 
             return res.status(404).json({ message: 'User not found in this home.' });
        }

        res.status(200).json({ users: home.users, message: 'User removed successfully.' }); 
    } catch (error) {
        handleError(res, error, 'Error removing user from home');
    }
};

// --- ניהול כספים ---
const addExpectedBill = async (req, res) => {
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

const updateExpectedBill = async (req, res) => {
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

const deleteExpectedBill = async (req, res) => {
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

const payBill = async (req, res) => {
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

const addIncome = async (req, res) => {
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

const addSavingsGoal = async (req, res) => {
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

const addFundsToSavingsGoal = async (req, res) => {
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

// **תיקון קריטי: סכום פיננסי לפי משתמש**
const getUserMonthlyFinanceSummary = async (req, res) => {
    try {
        const { homeId, year, month } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const numericYear = parseInt(year);
        const numericMonth = parseInt(month); // 1-12 for month

        const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
        const endOfMonth = new Date(numericYear, numericMonth, 0); // Last day of the month

        // אתחול אובייקט סיכום לכל המשתמשים ול"משותף"
        const userSummary = {};
        const allUsers = [...(home.users || []), 'משותף']; // וודא ש"משותף" נכלל
        allUsers.forEach(user => {
            userSummary[user] = { income: 0, expenses: 0, net: 0 };
        });

        // צבירת הכנסות לפי משתמש
        home.finances.income.forEach(inc => {
            const incomeDate = new Date(inc.date);
            if (incomeDate >= startOfMonth && incomeDate <= endOfMonth) {
                const user = inc.assignedTo || 'משותף';
                if (!userSummary[user]) userSummary[user] = { income: 0, expenses: 0, net: 0 }; 
                userSummary[user].income += inc.amount;
            }
        });

        // צבירת הוצאות (חשבונות ששולמו) לפי משתמש
        home.finances.paidBills.forEach(bill => {
            const paidDate = new Date(bill.datePaid); 
            if (paidDate >= startOfMonth && paidDate <= endOfMonth) {
                const user = bill.assignedTo || 'משותף';
                if (!userSummary[user]) userSummary[user] = { income: 0, expenses: 0, net: 0 }; 
                userSummary[user].expenses += bill.amount;
            }
        });

        // חישוב נטו לכל משתמש
        Object.keys(userSummary).forEach(user => {
            userSummary[user].net = userSummary[user].income - userSummary[user].expenses;
        });

        res.status(200).json(userSummary); // החזרת הסיכום לפי משתמש

    } catch (error) {
        handleError(res, error, 'Error fetching user monthly finance summary');
    }
};

// --- אינטגרציית Gemini AI ---
const transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText } = req.body;
        
        const mockShoppingList = [
            { text: "חלב", category: "מוצרי חלב" },
            { text: "ביצים", category: "מוצרי יסוד" },
            { text: "קמח", category: "אפייה" },
        ];

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.shoppingList.push(mockShoppingList); // שימוש בשם השדה המעודכן: shoppingList
        await home.save();

        res.status(200).json({ message: "Recipe transformed and items added to shopping list!", newItems: mockShoppingList });
    } catch (error) {
        handleError(res, error, 'Error transforming recipe with Gemini');
    }
};

const breakdownComplexTask = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { taskText } = req.body;
        
        const mockSubTasks = [
            { text: `תת-משימה 1 מתוך "${taskText}"`, category: "תת-משימה" },
            { text: `תת-משימה 2 מתוך "${taskText}"`, category: "תת-משימה" },
        ];

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.tasks.push(mockSubTasks); // שימוש בשם השדה המעודכן: tasks
        await home.save();

        res.status(200).json({ message: "Task broken down and sub-tasks added!", newItems: mockSubTasks });
    } catch (error) {
        handleError(res, error, 'Error breaking down task with Gemini');
    }
};

const updateBudgets = async (req, res) => {
    try {
        const home = await Home.findById(req.params.homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const updatedCategories = req.body;
        if (!Array.isArray(updatedCategories)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
        }

        home.finances.expenseCategories = updatedCategories;
        await home.save();
        res.status(200).json(home.finances.expenseCategories);
    } catch (error) {
        handleError(res, error, 'Error updating budgets');
    }
};

module.exports = {
    getHomes,
    getHomeDetails,
    loginToHome,
    createHome,
    addItem,
    updateItem,
    deleteItem,
    addUser,
    removeUser,
    addExpectedBill,
    updateExpectedBill,
    deleteExpectedBill,
    payBill,
    addIncome,
    addSavingsGoal,
    addFundsToSavingsGoal,
    updateBudgets, // הפונקציה שלנו עכשיו מיוצאת!
    getUserMonthlyFinanceSummary,
    transformRecipeToShoppingList,
    breakdownComplexTask
};