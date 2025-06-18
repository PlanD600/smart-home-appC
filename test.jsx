const Home = require('../models/Home');

// --- פונקציות עזר ---

// Helper function to handle common error responses
const handleError = (res, error, defaultMessage = 'An error occurred', statusCode = 500) => {
    console.error(error); // לצרכי דיבוג בשרת
    res.status(statusCode).json({ message: error.message || defaultMessage });
};

// "מנרמלת" את אובייקט הבית כדי להבטיח שכל השדות קיימים לפני השליחה לקליינט
const normalizeHomeObject = (home) => {
    if (!home) return null;

    // המרת מסמך Mongoose לאובייקט JavaScript רגיל
    const homeObject = home.toObject();

    // ודא שמערכים ברמה העליונה קיימים
    homeObject.shoppingList = homeObject.shoppingList || [];
    homeObject.tasks = homeObject.tasks || [];
    homeObject.users = homeObject.users || [];
    homeObject.templates = homeObject.templates || []; // חדש: לוודא קיום גם של templates

    // ודא שאובייקט הכספים וכל המערכים המקוננים בתוכו קיימים
    homeObject.finances = {
        expectedBills: homeObject.finances?.expectedBills || [],
        paidBills: homeObject.finances?.paidBills || [],
        income: homeObject.finances?.income || [],
        savingsGoals: homeObject.finances?.savingsGoals || [],
        expenseCategories: homeObject.finances?.expenseCategories || {
            'Groceries': 0, 'Utilities': 0, 'Rent': 0, 'Entertainment': 0, 'Other': 0
        }
    };

    // וודא ש-expenseCategories הוא אובייקט, גם אם בטעות נוצר כמערך
    if (Array.isArray(homeObject.finances.expenseCategories)) {
        const defaultCategories = {
            'Groceries': 0, 'Utilities': 0, 'Rent': 0, 'Entertainment': 0, 'Other': 0
        };
        // המר מערך אובייקטים לאובייקט שטוח, אם זה המבנה המיועד
        // אם המבנה הוא {name: "Groceries", budgetAmount: 0} אז צריך להתאים כאן
        // כרגע ההנחה היא שמבנה הנתונים הוא: {'CategoryName': BudgetAmount}
        homeObject.finances.expenseCategories = homeObject.finances.expenseCategories.reduce((acc, curr) => {
            if (curr.name && typeof curr.budgetAmount === 'number') {
                acc[curr.name] = curr.budgetAmount;
            }
            return acc;
        }, defaultCategories);
    }


    return homeObject;
};

// --- פונקציות ה-Controller ---

// קבל את כל הבתים (למסך הלוגין)
exports.getHomes = async (req, res) => {
    try {
        // שלוף את השדות הרלוונטיים למסך הלוגין
        const homes = await Home.find({}, '_id name iconClass colorScheme');
        res.status(200).json(homes);
    } catch (error) {
        handleError(res, error, 'Error fetching homes');
    }
};

// קבל פרטים מלאים של בית יחיד
exports.getHomeDetails = async (req, res) => {
    try {
        const { homeId } = req.params;
        console.time('getHomeDetails_fetch'); 
        const home = await Home.findById(homeId);
        console.timeEnd('getHomeDetails_fetch'); 

        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }
        console.time('getHomeDetails_normalize'); 
        const normalizedHome = normalizeHomeObject(home);
        console.timeEnd('getHomeDetails_normalize'); 
        res.status(200).json(normalizedHome);
    } catch (error) {
        handleError(res, error, 'Error fetching home details', 400);
    }
};

// התחברות לבית ספציפי (מאובטח יותר עם compareAccessCode)
exports.loginToHome = async (req, res) => {
    try {
        const { homeId, accessCode } = req.body;
        console.time('loginToHome_fetch'); 
        const home = await Home.findById(homeId);
        console.timeEnd('loginToHome_fetch'); 

        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        console.time('loginToHome_compareAccessCode'); 
        const isMatch = await home.compareAccessCode(accessCode);
        console.timeEnd('loginToHome_compareAccessCode'); 
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid access code' });
        }

        console.time('loginToHome_normalize'); 
        const normalizedHome = normalizeHomeObject(home);
        console.timeEnd('loginToHome_normalize'); 
        res.status(200).json(normalizedHome);
    } catch (error) {
        handleError(res, error, 'Server error during login', 500);
    }
};

// פונקציה ליצירת בית חדש - עם אתחול מלא (כמו בקוד החדש)
exports.createHome = async (req, res) => {
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
          expenseCategories: {
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

// הוספת פריט (קניות או משימות) - משולב עם שדות מורחבים ו-listType דינמי
exports.addItem = async (req, res) => {
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

// עדכון פריט - משולב עם .id(itemId) מהקוד החדש
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

// מחיקת פריט - משולב עם .pull() מהקוד החדש
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

        const listField = listType === 'shopping' ? 'shoppingList' : 'tasks';
        home[listField].pull({ _id: itemId });
        
        await home.save();
        res.status(204).send(); 
    } catch (error) {
        handleError(res, error, 'Error deleting item');
    }
};

// ניהול משתמשים - מאוחד: addUser ו-removeUser
exports.addUser = async (req, res) => {
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

exports.removeUser = async (req, res) => {
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

// --- ניהול כספים (נותר כפי שהיה בקוד הישן, עם תיקוני handleError) ---
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
        const { expenseCategories } = req.body; // Expecting an object of categories with amounts
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // חשוב: לוודא ש-expenseCategories אכן אובייקט ולא מערך ב-schema של Home
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

        // Initialize summary object for all users and "משותף"
        const userSummary = {};
        const allUsers = [...(home.users || []), 'משותף']; // Ensure 'משותף' is included
        allUsers.forEach(user => {
            userSummary[user] = { income: 0, expenses: 0, net: 0 };
        });

        // Aggregate income per user
        home.finances.income.forEach(inc => {
            const incomeDate = new Date(inc.date);
            if (incomeDate >= startOfMonth && incomeDate <= endOfMonth) {
                const user = inc.assignedTo || 'משותף';
                if (!userSummary[user]) userSummary[user] = { income: 0, expenses: 0, net: 0 }; // Handle new users
                userSummary[user].income += inc.amount;
            }
        });

        // Aggregate expenses (paid bills) per user
        home.finances.paidBills.forEach(bill => {
            const paidDate = new Date(bill.datePaid); // Use datePaid from paidBills
            if (paidDate >= startOfMonth && paidDate <= endOfMonth) {
                const user = bill.assignedTo || 'משותף';
                if (!userSummary[user]) userSummary[user] = { income: 0, expenses: 0, net: 0 }; // Handle new users
                userSummary[user].expenses += bill.amount;
            }
        });

        // Calculate net for each user
        Object.keys(userSummary).forEach(user => {
            userSummary[user].net = userSummary[user].income - userSummary[user].expenses;
        });

        res.status(200).json(userSummary); // Return the per-user summary

    } catch (error) {
        handleError(res, error, 'Error fetching user monthly finance summary');
    }
};

// --- אינטגרציית Gemini AI (נותר כפי שהיה בקוד הישן, עם תיקוני handleError ושמות שדות) ---
exports.transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText } = req.body;
        
        // Mock response:
        const mockShoppingList = [
            { text: "חלב", category: "מוצרי חלב" },
            { text: "ביצים", category: "מוצרי יסוד" },
            { text: "קמח", category: "אפייה" },
        ];

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // שימוש בשם השדה המעודכן: shoppingList
        mockShoppingList.forEach(item => home.shoppingList.push(item));
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
        
        // Mock response:
        const mockSubTasks = [
            { text: `תת-משימה 1 מתוך "${taskText}"`, category: "תת-משימה" },
            { text: `תת-משימה 2 מתוך "${taskText}"`, category: "תת-משימה" },
        ];

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // שימוש בשם השדה המעודכן: tasks
        mockSubTasks.forEach(item => home.tasks.push(item));
        await home.save();

        res.status(200).json({ message: "Task broken down and sub-tasks added!", newItems: mockSubTasks });
    } catch (error) {
        handleError(res, error, 'Error breaking down task with Gemini');
    }
};