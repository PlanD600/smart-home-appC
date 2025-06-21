const Home = require('../models/Home');
const mongoose = require('mongoose'); // ייבוא mongoose כדי להשתמש ב-ObjectId

// --- פונקציות עזר ---

/**
 * מטפלת בשליחת תגובות שגיאה אחידות ללקוח.
 * @param {object} res - אובייקט התגובה של Express.
 * @param {Error} error - אובייקט השגיאה.
 * @param {string} defaultMessage - הודעה כללית למקרה של שגיאה בלתי צפויה.
 * @param {number} statusCode - קוד סטטוס HTTP לתגובה.
 */
const handleError = (res, error, defaultMessage = 'An error occurred', statusCode = 500) => {
    console.error(error);
    const errorMessage = error.message || defaultMessage;
    res.status(statusCode).json({ message: defaultMessage, error: errorMessage });
};

// הגדרת קטגוריות הוצאות ברירת מחדל (כולל אייקונים וצבעים)
const defaultExpenseCategories = [
    { name: 'כללית', budgetAmount: 0, color: '#CCCCCC', icon: 'fa-tag' },
    { name: 'מצרכים', budgetAmount: 0, color: '#AED581', icon: 'fa-shopping-basket' },
    { name: 'חשבונות', budgetAmount: 0, color: '#FFB74D', icon: 'fa-file-invoice' },
    { name: 'בידור', budgetAmount: 0, color: '#4FC3F7', icon: 'fa-film' },
    { name: 'תחבורה', budgetAmount: 0, color: '#78909C', icon: 'fa-car' },
    { name: 'מסעדות', budgetAmount: 0, color: '#D4E157', icon: 'fa-utensils' },
    { name: 'בריאות', budgetAmount: 0, color: '#EF5350', icon: 'fa-heartbeat' },
    { name: 'חינוך', budgetAmount: 0, color: '#AB47BC', icon: 'fa-book' },
    { name: 'שונות', budgetAmount: 0, color: '#BA68C8', icon: 'fa-ellipsis-h' },
];

/**
 * "מנרמלת" את אובייקט הבית כדי להבטיח מבנה נתונים אחיד ונכון לקליינט,
 * כולל אתחול של רשימות פיננסיות וטיפול בקטגוריות הוצאות.
 * @param {object} home - אובייקט הבית ממסד הנתונים.
 * @returns {object|null} - אובייקט הבית מנוטרל.
 */
const normalizeHomeObject = (home) => {
    if (!home) return null;

    const homeObject = home.toObject ? home.toObject() : { ...home };

    homeObject.users = homeObject.users || [];
    homeObject.shoppingList = homeObject.shoppingList || [];
    homeObject.tasks = homeObject.tasks || [];
    homeObject.templates = homeObject.templates || [];
    homeObject.iconClass = homeObject.iconClass || 'fas fa-home'; 
    homeObject.colorClass = homeObject.colorClass || 'card-color-1'; 

    homeObject.finances = homeObject.finances || {};
    const finances = homeObject.finances;

    finances.expectedBills = finances.expectedBills || [];
    finances.paidBills = finances.paidBills || [];
    finances.income = finances.income || []; 
    finances.savingsGoals = finances.savingsGoals || [];
    finances.financeSettings = finances.financeSettings || { currency: 'ש"ח' }; 

    let categories = finances.expenseCategories || [];

    if (!Array.isArray(categories)) {
        categories = Object.entries(categories).map(([name, budgetAmount]) => {
            const existingCategory = defaultExpenseCategories.find(cat => cat.name === name);
            return {
                name: name,
                budgetAmount: typeof budgetAmount === 'number' ? budgetAmount : 0,
                color: existingCategory ? existingCategory.color : '#CCCCCC',
                icon: existingCategory ? existingCategory.icon : 'fa-tag'
            };
        });
    } else {
        categories = categories.map(cat => {
            const defaultCat = defaultExpenseCategories.find(dCat => dCat.name === cat.name);
            return {
                name: cat.name,
                budgetAmount: typeof cat.budgetAmount === 'number' ? cat.budgetAmount : 0,
                color: cat.color || (defaultCat ? defaultCat.color : '#CCCCCC'),
                icon: cat.icon || (defaultCat ? defaultCat.icon : 'fa-tag')
            };
        });
    }

    if (categories.length === 0) {
        categories = [...defaultExpenseCategories];
    }

    homeObject.finances.expenseCategories = categories;

    return homeObject;
};

// --- פונקציות ה-Controller ---

const getHomes = async (req, res) => {
    try {
        const homes = await Home.find({}, '_id name iconClass colorClass');
        const normalizedHomes = homes.map(home => normalizeHomeObject(home));
        res.status(200).json(normalizedHomes);
    } catch (error) {
        handleError(res, error, 'Error fetching homes');
    }
};

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

const createHome = async (req, res) => {
    const { name, accessCode, iconClass, colorClass, users, currency } = req.body;

    if (!name || !accessCode) {
        return res.status(400).json({ message: 'Name and access code are required' });
    }
    if (!users || !Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: 'At least one user is required to create a home.' });
    }

    try {
        const homeExists = await Home.findOne({ name });
        if (homeExists) {
            console.log(`Home with name "${name}" already exists.`);
            return res.status(409).json({ message: 'A home with this name already exists.' });
        }

        const formattedUsers = users.map(user => {
            if (typeof user === 'string') {
                return { name: user, isAdmin: false };
            }
            return { name: user.name, isAdmin: user.isAdmin || false };
        });

        if (formattedUsers.length > 0) {
            formattedUsers[0].isAdmin = true;
        }

        const newHome = new Home({
            name,
            accessCode,
            iconClass: iconClass || 'fas fa-home',
            colorClass: colorClass || 'card-color-1',
            currency: currency || 'ILS',
            users: formattedUsers,
            shoppingList: [],
            tasks: [],
            templates: [],
            finances: {
                expectedBills: [],
                paidBills: [],
                income: [],
                savingsGoals: [],
                expenseCategories: defaultExpenseCategories,
                financeSettings: { currency: currency || 'ש"ח' }
            }
        });

        await newHome.save();
        res.status(201).json(normalizeHomeObject(newHome));
    } catch (error) {
        console.error("Server error creating home:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A home with this name already exists.' });
        }
        handleError(res, error, 'Server error creating home');
    }
};

const addItemToList = async (req, res) => {
    const { homeId, listType } = req.params;
    const { text, ...otherItemData } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Item text is required.' });
    }
    if (!['shoppingList', 'tasks'].includes(listType)) {
        return res.status(400).json({ message: 'Invalid list type. Must be "shoppingList" or "tasks".' });
    }

    // === תיקון: יצירת _id מפורש עבור הפריט החדש ===
    // זה מבטיח שלכל תת-מסמך יהיה ObjectId תקני, מה שיקל על מחיקתו.
    const newItem = {
        _id: new mongoose.Types.ObjectId(), 
        text,
        ...otherItemData
    };
    // ===============================================

    try {
        const updatedHome = await Home.findByIdAndUpdate(
            homeId,
            { $push: { [listType]: newItem } },
            { new: true, runValidators: true }
        );

        if (!updatedHome) {
            return res.status(404).json({ message: 'Home not found' });
        }

        const list = updatedHome[listType];
        res.status(201).json(list[list.length - 1]);

    } catch (error) {
        console.error(`Server error adding item to ${listType}:`, error);
        handleError(res, error, `Failed to add item to ${listType}`);
    }
};

const updateItemInList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const updates = req.body;

    if (!['shoppingList', 'tasks'].includes(listType)) {
        return res.status(400).json({ message: 'Invalid list type. Must be "shoppingList" or "tasks".' });
    }

    const updateSet = {};
    for (const key in updates) {
        // עבור עדכונים פשוטים של שדות ברמה העליונה של הפריט.
        // אם מנסים לעדכן תת-משימות מקוננות, זה ידרוש לוגיקה מורכבת יותר
        // עם אופרטורים כמו $set עם arrayFilters, או מציאה ועדכון ידני של הפריט
        updateSet[`${listType}.$.${key}`] = updates[key];
    }

    try {
        const updatedHome = await Home.findOneAndUpdate(
            { _id: homeId, [`${listType}._id`]: itemId },
            { $set: updateSet },
            { new: true, runValidators: true }
        );

        if (!updatedHome) {
            return res.status(404).json({ message: 'Home or item not found' });
        }

        const updatedItem = updatedHome[listType].find(item => item._id.toString() === itemId);
        res.status(200).json(updatedItem);

    } catch (error) {
        console.error(`Server error updating item in ${listType}:`, error);
        handleError(res, error, `Failed to update item in ${listType}`);
    }
};

const deleteItemFromList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;

    if (!['shoppingList', 'tasks'].includes(listType)) {
        return res.status(400).json({ message: 'Invalid list type. Must be "shoppingList" or "tasks".' });
    }

    try {
        console.log(`[Backend Debug] Attempting to delete item: ${itemId} from ${listType} in home: ${homeId}`);
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        // === תיקון: שימוש ב-findIndex ו-splice למחיקה מדויקת ואמינה יותר ===
        // במקום $pull, שנכשל במקרים מסוימים עם תתי-מסמכים
        const itemIndex = home[listType].findIndex(item => item._id && item._id.toString() === itemId);
        
        if (itemIndex === -1) {
            console.warn(`[Backend Debug] Item ${itemId} not found in ${listType} for home ${homeId} via findIndex. This might be a nested item or already deleted.`);
            // אם הפריט לא נמצא ברמה העליונה, זה יכול להיות תת-פריט.
            // לוגיקה למחיקת תת-פריט תהיה מורכבת יותר (מצא את האב, ואז מחק את התת-פריט).
            // כרגע, נניח שמחיקה היא רק ברמה העליונה או שהמטפל ב-Frontend יודע לטפל בקינון.
            return res.status(404).json({ message: 'Item not found in list or is a sub-item not handled directly.' });
        }

        home[listType].splice(itemIndex, 1); // הסר את הפריט לפי אינדקס
        // =========================================================

        await home.save();
        res.status(200).json({ message: 'Item deleted successfully.' });

    } catch (error) {
        console.error(`Server error deleting item from ${listType}:`, error);
        handleError(res, error, `Failed to delete item from ${listType}`);
    }
};

/**
 * מחיקת כל הפריטים מסוג מסוים מרשימה (לדוגמה, כל רשימת הקניות).
 * PATCH /api/home/:homeId/:listType/clear
 * זה שינוי שימחק את כל הפריטים ברשימה מסוימת.
 */
const clearAllItemsFromList = async (req, res) => {
    const { homeId, listType } = req.params;

    if (!['shoppingList', 'tasks'].includes(listType)) {
        return res.status(400).json({ message: 'Invalid list type. Must be "shoppingList" or "tasks".' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        home[listType] = []; // איפוס הרשימה

        await home.save();
        res.status(200).json({ message: `All items cleared from ${listType} successfully.` });

    } catch (error) {
        console.error(`Server error clearing all items from ${listType}:`, error);
        handleError(res, error, `Failed to clear all items from ${listType}`);
    }
};


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

        if (home.users.some(u => u.name === userName)) {
            return res.status(409).json({ message: 'User with this name already exists in this home.' });
        }

        home.users.push({ name: userName, isAdmin: false });
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

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const userIndex = home.users.findIndex(u => u.name === userName);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found in this home.' });
        }
        
        if (home.users.length === 1 && home.users[0].name === userName) {
            return res.status(400).json({ message: 'Cannot remove the last user from the home.' });
        }

        home.users.splice(userIndex, 1);
        await home.save();

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
        res.status(201).json(home.finances.expectedBills[home.finances.expectedBills.length - 1]);
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

        const bill = home.finances.expectedBills.id(billId);
        if (!bill) return res.status(404).json({ message: 'Bill not found.' });

        Object.assign(bill, billData);
        await home.save();
        res.status(200).json(bill);
    } catch (error) {
        handleError(res, error, 'Error updating expected bill');
    }
};

const deleteExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.expectedBills.pull({ _id: billId });
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

        const billToPay = home.finances.expectedBills.id(billId);
        if (!billToPay) return res.status(404).json({ message: 'Bill not found in expected bills.' });

        const paidBill = { ...billToPay.toObject(), datePaid: new Date() };
        home.finances.paidBills.push(paidBill);

        home.finances.expectedBills.pull({ _id: billId });

        await home.save();
        res.status(200).json(home.finances);
    }
    catch (error) {
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
        res.status(201).json(home.finances.income[home.finances.income.length - 1]);
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
        res.status(201).json(home.finances.savingsGoals[home.finances.savingsGoals.length - 1]);
    } catch (error) {
        handleError(res, error, 'Error adding savings goal');
    }
};

const addFundsToSavingsGoal = async (req, res) => {
    try {
        const { homeId, goalId } = req.params;
        const { amount } = req.body;
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required.' });
        }

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

const getUserMonthlyFinanceSummary = async (req, res) => {
    try {
        const { homeId, year, month } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const numericYear = parseInt(year);
        const numericMonth = parseInt(month); // 1-12 for month

        const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
        const endOfMonth = new Date(numericYear, numericMonth, 0, 23, 59, 59, 999); // Last day of the month

        const allUsers = [...new Set([
            ...(home.users || []).map(u => u.name),
            'אני',
            'משותף'
        ])];

        const userSummary = {};
        allUsers.forEach(user => {
            userSummary[user] = { income: 0, expenses: 0, net: 0 };
        });

        home.finances.income.forEach(inc => {
            const incomeDate = new Date(inc.date);
            if (incomeDate >= startOfMonth && incomeDate <= endOfMonth) {
                const user = inc.assignedTo || 'משותף';
                if (userSummary[user]) {
                    userSummary[user].income += inc.amount;
                }
            }
        });

        home.finances.paidBills.forEach(bill => {
            const paidDate = new Date(bill.datePaid);
            if (paidDate >= startOfMonth && paidDate <= endOfMonth) {
                const user = bill.assignedTo || 'משותף';
                if (userSummary[user]) {
                    userSummary[user].expenses += bill.amount;
                }
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

// --- אינטגרציית Gemini AI ---
const transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText } = req.body;
        
        // כאן תהיה קריאה ל-Gemini API (כשתטמיע אותה)
        // לדוגמה: const geminiResponse = await callGeminiAPI(recipeText);
        // const newItemsFromGemini = parseGeminiResponse(geminiResponse);

        // Mock response for now
        const mockShoppingList = [
            { text: "חלב", category: "מוצרי חלב", _id: new mongoose.Types.ObjectId() },
            { text: "ביצים", category: "מוצרי יסוד", _id: new mongoose.Types.ObjectId() },
            { text: "קמח", category: "אפייה", _id: new mongoose.Types.ObjectId() },
            { text: "סוכר", category: "אפייה", _id: new mongoose.Types.ObjectId() },
        ];

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.shoppingList.push(...mockShoppingList);
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
        
        // Mock response for a nested task structure
        const mockMainTask = {
            _id: new mongoose.Types.ObjectId(), // ID למשימה הראשית
            text: `ארגון: ${taskText}`,
            category: "אירועים",
            isUrgent: true,
            subItems: [ // תתי-משימות
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `1. הכנת רשימת מוזמנים`,
                    category: "תכנון",
                    completed: false,
                    _id: new mongoose.Types.ObjectId(), // Add _id for subItem
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `2. בחירת מקום`,
                    category: "תכנון",
                    completed: false,
                    _id: new mongoose.Types.ObjectId(), // Add _id for subItem
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `3. קניית כיבוד ושתיה`,
                    category: "קניות",
                    subItems: [ // קינון נוסף לדוגמה
                        { _id: new mongoose.Types.ObjectId(), text: 'קניית חטיפים', completed: false },
                        { _id: new mongoose.Types.ObjectId(), text: 'קניית שתיה קלה', completed: false },
                    ]
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `4. שליחת הזמנות`,
                    category: "ביצוע",
                    completed: false,
                    _id: new mongoose.Types.ObjectId(), // Add _id for subItem
                },
            ]
        };

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.tasks.push(mockMainTask);
        await home.save();

        res.status(200).json({ message: "Task broken down and sub-tasks added!", newItems: [mockMainTask] });
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
    addItemToList,
    updateItemInList,
    deleteItemFromList,
    clearAllItemsFromList,
    addUser,
    removeUser,
    addExpectedBill,
    updateExpectedBill,
    deleteExpectedBill,
    payBill,
    addIncome,
    addSavingsGoal,
    addFundsToSavingsGoal,
    updateBudgets,
    getUserMonthlyFinanceSummary,
    transformRecipeToShoppingList,
    breakdownComplexTask
};
