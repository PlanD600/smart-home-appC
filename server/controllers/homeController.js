const Home = require('../models/Home');
const mongoose = require('mongoose'); // ייבוא mongoose כדי להשתמש ב-ObjectId

// --- פונקציות עזר כלליות ---

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
    homeObject.tasksList = homeObject.tasksList || []; // שינוי ל-tasksList
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

// --- פונקציות עזר רקורסיביות לטיפול בפריטים מקוננים ---

/**
 * פונקציית עזר רקורסיבית למציאה ומחיקה של פריט מרשימה מקוננת
 * @param {Array} items - רשימת הפריטים לסרוק
 * @param {String} itemId - ה-ID של הפריט למחיקה
 * @returns {Boolean} - מחזיר true אם הפריט נמצא ונמחק, אחרת false
*/
const findAndRemoveItem = (items, itemId) => {
    const itemIndex = items.findIndex(item => item._id && item._id.toString() === itemId);

    if (itemIndex > -1) {
        items.splice(itemIndex, 1);
        return true;
    }

    for (const item of items) {
        if (item.subItems && item.subItems.length > 0) {
            if (findAndRemoveItem(item.subItems, itemId)) {
                return true;
            }
        }
    }

    return false;
};

/**
 * פונקציית עזר רקורסיבית לסינון פריטים שהושלמו מרשימה מקוננת
 * @param {Array} items - רשימת הפריטים לסינון
 * @returns {Array} - רשימה חדשה ללא הפריטים שהושלמו
*/
const filterCompleted = (items) => {
    return items
        .filter(item => !item.completed)
        .map(item => {
            if (item.subItems && item.subItems.length > 0) {
                // סינון רקורסיבי של תתי-הרשימות
                item.subItems = filterCompleted(item.subItems);
            }
            return item;
        });
};

/**
 * פונקציית עזר חדשה שממירה שם רשימה מקוצר לשם המלא שלה במסד הנתונים
 * @param {string} shortName - "shopping" or "tasks".
 * @returns {string|null} - "shoppingList", "tasksList", or null.
*/
const getListKey = (shortName) => {
    const map = {
        shopping: 'shoppingList',
        tasks: 'tasksList' // שינוי ל-tasksList
    };
    return map[shortName] || null; // החזר null אם אין התאמה
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
            currency: currency || 'ש"ח', // אחידות עם financeSettings
            users: formattedUsers,
            shoppingList: [],
            tasksList: [], // שינוי ל-tasksList
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
    const { homeId, listType } = req.params; // listType יהיה "shopping" or "tasks"
    const { text, createdBy, ...otherItemData } = req.body; // הוספת createdBy

    const listKey = getListKey(listType);
    if (!listKey || !['shoppingList', 'tasksList'].includes(listKey)) {
        return res.status(400).json({ message: 'Invalid list type provided.' });
    }

    if (!text) {
        return res.status(400).json({ message: 'Item text is required.' });
    }
    
    /**
     * יצירת _id מפורש עבור הפריט החדש, כולל תתי-פריטים אם קיימים
     * @param {object} item - אובייקט הפריט
     * @returns {object} - אובייקט הפריט עם _id חדש
     */
    const createItemWithIds = (item) => {
        const newItem = {
            _id: new mongoose.Types.ObjectId(), 
            text: item.text,
            ...item
        };
        if (item.subItems && Array.isArray(item.subItems)) {
            newItem.subItems = item.subItems.map(createItemWithIds);
        }
        return newItem;
    };

    const newItemData = { text, createdBy: createdBy || 'System', ...otherItemData }; // הגדרת ברירת מחדל ל-createdBy
    const newItem = createItemWithIds(newItemData);

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found' });
        
        home[listKey].push(newItem);
        await home.save();
        
        const addedItem = home[listKey].id(newItem._id); // שלוף את הפריט המלא עם כל ברירות המחדל שמונגוז הוסיף
        res.status(201).json(addedItem); // החזר את הפריט המלא והמעודכן

    } catch (error) {
        console.error(`Server error adding item to ${listType}:`, error);
        handleError(res, error, `Failed to add item to ${listType}`);
    }
};

const updateItemInList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const updates = req.body;

    const listKey = getListKey(listType);
    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided. Must be "shopping" or "tasks".' });
    }

    const updateSet = {};
    for (const key in updates) {
        // עבור עדכונים פשוטים של שדות ברמה העליונה של הפריט.
        // אם מנסים לעדכן תת-משימות מקוננות, זה ידרוש לוגיקה מורכבת יותר
        // עם אופרטורים כמו $set עם arrayFilters, או מציאה ועדכון ידני של הפריט
        // כרגע, זה תומך רק בעדכון פריטי רמה עליונה.
        updateSet[`${listKey}.$.${key}`] = updates[key]; // שימוש ב-listKey
    }

    try {
        const updatedHome = await Home.findOneAndUpdate(
            { _id: homeId, [`${listKey}._id`]: itemId }, // שימוש ב-listKey
            { $set: updateSet },
            { new: true, runValidators: true }
        );

        if (!updatedHome) {
            // אם הפריט לא נמצא ברמה העליונה, ייתכן שהוא תת-פריט.
            // לוגיקה לעדכון תת-פריט דורשת סריקה רקורסיבית ומורכבת יותר.
            return res.status(404).json({ message: 'Home or item not found. Nested item updates are not directly supported yet via this endpoint.' });
        }

        const updatedItem = updatedHome[listKey].find(item => item._id.toString() === itemId); // שימוש ב-listKey
        res.status(200).json(updatedItem);

    } catch (error) {
        console.error(`Server error updating item in ${listType}:`, error);
        handleError(res, error, `Failed to update item in ${listType}`);
    }
};

const deleteItemFromList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;

    const listKey = getListKey(listType);
    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided. Must be "shopping" or "tasks".' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        // שימוש בפונקציית העזר הרקורסיבית למחיקה
        const itemRemoved = findAndRemoveItem(home[listKey], itemId); // שימוש ב-listKey
        
        if (itemRemoved) {
            await home.save();
            // נחזיר את הבית המעודכן כדי שהקליינט יוכל לסנכרן את מצבו
            res.status(200).json(normalizeHomeObject(home)); 
        } else {
            res.status(404).json({ message: 'Item not found in list or sub-items.' });
        }

    } catch (error) {
        console.error(`Server error deleting item from ${listType}:`, error);
        handleError(res, error, `Failed to delete item from ${listType}`);
    }
};

/**
 * מחיקת כל הפריטים מרשימה מסוימת (לדוגמה, כל רשימת הקניות).
 * PATCH /api/home/:homeId/:listType/clear
*/
const clearAllItemsFromList = async (req, res) => {
    const { homeId, listType } = req.params;

    const listKey = getListKey(listType);
    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided. Must be "shopping" or "tasks".' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        home[listKey] = []; // איפוס הרשימה, שימוש ב-listKey

        await home.save();
        res.status(200).json({ message: `All items cleared from ${listType} successfully.`, home: normalizeHomeObject(home) });

    } catch (error) {
        console.error(`Server error clearing all items from ${listType}:`, error);
        handleError(res, error, `Failed to clear all items from ${listType}`);
    }
};

/**
 * מחיקת כל הפריטים שהושלמו (completed: true) מרשימה מסוימת, כולל תתי-מטלות.
 * PATCH /api/home/:homeId/:listType/clear-completed
*/
const clearCompletedItems = async (req, res) => {
    const { homeId, listType } = req.params;
    
    const listKey = getListKey(listType);
    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided. Must be "shopping" or "tasks".' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found' });
        
        // שימוש בפונקציית העזר הרקורסיבית לסינון
        home[listKey] = filterCompleted(home[listKey]); // שימוש ב-listKey

        await home.save();
        res.status(200).json(normalizeHomeObject(home));

    } catch (error) {
        handleError(res, error, 'Server Error: Failed to clear completed items.');
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

const updateHome = async (req, res) => {
    try {
        const { homeId } = req.params;
        const updates = req.body;
        
        // Validate homeId
        if (!homeId) {
            return res.status(400).json({ message: 'Home ID is required' });
        }
        
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }
        
        // Apply updates
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                home[key] = updates[key];
            }
        });
        
        await home.save();
        const normalizedHome = normalizeHomeObject(home);
        res.status(200).json(normalizedHome);
    } catch (error) {
        handleError(res, error, 'Error updating home');
    }
};



// --- ניהול כספים ---
const addExpectedBill = async (req, res) => {
    try {
        const { homeId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found' });

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
        // הוספנו את billId מפרמטרי הבקשה
        const { homeId, billId } = req.params; 
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // השתמשנו במשתנה הנכון
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

// --- אינטגרציית Gemini AI (מודק) ---
const transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText } = req.body;
        
        // כאן תהיה קריאה ל-Gemini API (כשתטמיע אותה בפועל)
        // לדוגמה: const geminiResponse = await callGeminiAPI(recipeText);
        // const newItemsFromGemini = parseGeminiResponse(geminiResponse);

        // Mock response for now, ensures _id for each item
        const mockIngredients = recipeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const newItems = mockIngredients.map(ingredient => ({
            _id: new mongoose.Types.ObjectId(), // ID חדש
            text: ingredient,
            category: 'מצרכים מהמתכון',
            completed: false,
            createdAt: new Date()
        }));

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.shoppingList.push(...newItems);
        await home.save();

        res.status(200).json({ message: "Recipe transformed and items added to shopping list!", newItems: newItems });
    } catch (error) {
        handleError(res, error, 'Error transforming recipe with Gemini');
    }
};

const saveTemplates = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { templates } = req.body;
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }
        home.templates = templates;
        await home.save();
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error saving templates');
    }
};


const breakdownComplexTask = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { taskText } = req.body;
        
        // Mock response for a nested task structure with unique IDs
        const mockMainTask = {
            _id: new mongoose.Types.ObjectId(), 
            text: taskText,
            category: "משימה מורכבת",
            isUrgent: true,
            createdAt: new Date(),
            subItems: [ 
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `שלב א: תכנון (${taskText})`,
                    category: "תכנון",
                    completed: false,
                    createdAt: new Date(),
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `שלב ב: ביצוע (${taskText})`,
                    category: "ביצוע",
                    completed: false,
                    createdAt: new Date(),
                    subItems: [ 
                        { _id: new mongoose.Types.ObjectId(), text: 'שלב ב.1: איסוף חומרים', completed: false, createdAt: new Date() },
                        { _id: new mongoose.Types.ObjectId(), text: 'שלב ב.2: הרכבה', completed: false, createdAt: new Date() },
                    ]
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `שלב ג: בדיקות (${taskText})`,
                    category: "בדיקות",
                    completed: false,
                    createdAt: new Date(),
                },
            ]
        };

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.tasksList.push(mockMainTask); // שינוי ל-tasksList
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
    clearCompletedItems, 
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
    breakdownComplexTask,
    saveTemplates,
    updateHome,
};
