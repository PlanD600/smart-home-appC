const Home = require('../models/Home');

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
    // משתמשים בהודעת השגיאה הספציפית אם קיימת, אחרת בהודעת ברירת המחדל.
    const errorMessage = error.message || defaultMessage;
    res.status(statusCode).json({ message: defaultMessage, error: errorMessage });
};

// הגדרת קטגוריות הוצאות ברירת המחדל, כולל שדות חדשים כמו 'icon' וצבעים.
const defaultExpenseCategories = [
    { name: 'כללית', budgetAmount: 0, color: '#CCCCCC', icon: 'fa-tag' }, // צבע ואייקון ברירת מחדל
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
 * @param {object} home - אובייקט הבית ממסד הנתונים (או אובייקט רגיל).
 * @returns {object|null} - אובייקט הבית מנוטרל, או null אם הקלט null.
 */
const normalizeHomeObject = (home) => {
    if (!home) return null;

    // המרת אובייקט Mongoose לאובייקט JavaScript רגיל אם הוא כזה
    const homeObject = home.toObject ? home.toObject() : { ...home };

    // וודא קיום של מערכים ושדות מרכזיים
    homeObject.users = homeObject.users || [];
    homeObject.shoppingList = homeObject.shoppingList || [];
    homeObject.tasks = homeObject.tasks || [];
    homeObject.templates = homeObject.templates || [];
    homeObject.iconClass = homeObject.iconClass || 'fas fa-home'; // ערך ברירת מחדל אם לא קיים
    homeObject.colorClass = homeObject.colorClass || 'card-color-1'; // ערך ברירת מחדל אם לא קיים

    // טיפול באובייקט הפיננסים
    homeObject.finances = homeObject.finances || {};
    const finances = homeObject.finances;

    // וודא קיום של רשימות פיננסיות
    finances.expectedBills = finances.expectedBills || [];
    finances.paidBills = finances.paidBills || [];
    finances.income = finances.income || []; // שימוש ב'income' כפי שמוגדר ב-FinanceSchema
    finances.savingsGoals = finances.savingsGoals || [];
    finances.financeSettings = finances.financeSettings || { currency: 'ש"ח' }; // וודא קיום financeSettings

    // **לוגיקה קריטית: מוודאים ש-expenseCategories הוא תמיד מערך של אובייקטים**
    let categories = finances.expenseCategories || [];

    // אם הנתונים ב-DB הם בטעות אובייקט (כמו ב-createHome הישן), נמיר אותם למערך אובייקטים מלא
    // ונוודא שכל שדה (name, budgetAmount, color, icon) קיים.
    if (!Array.isArray(categories)) {
        categories = Object.entries(categories).map(([name, budgetAmount]) => {
            const existingCategory = defaultExpenseCategories.find(cat => cat.name === name);
            return {
                name: name,
                budgetAmount: typeof budgetAmount === 'number' ? budgetAmount : 0,
                color: existingCategory ? existingCategory.color : '#CCCCCC', // צבע כללי אם אין התאמה
                icon: existingCategory ? existingCategory.icon : 'fa-tag' // אייקון כללי אם אין התאמה
            };
        });
    } else {
        // וודא שכל אובייקט קטגוריה מכיל את כל השדות הנדרשים (icon, color, budgetAmount)
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

    // אם המערך ריק לאחר הנורמולציה, ניצור קטגוריות ברירת מחדל
    if (categories.length === 0) {
        categories = [...defaultExpenseCategories];
    }

    homeObject.finances.expenseCategories = categories; // עדכון ה-finances בתוך homeObject

    return homeObject;
};

// --- פונקציות ה-Controller ---

/**
 * קבלת רשימת בתים למסך הלוגין (רק _id, name, iconClass, colorClass).
 * GET /api/homes
 */
const getHomes = async (req, res) => {
    try {
        // שימו לב: השדה במודל הוא 'colorClass', לא 'colorScheme' 
        const homes = await Home.find({}, '_id name iconClass colorClass');
        res.status(200).json(homes);
    } catch (error) {
        handleError(res, error, 'Error fetching homes');
    }
};

/**
 * קבלת פרטים מלאים של בית יחיד לפי ID.
 * GET /api/home/:homeId
 */
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

/**
 * התחברות לבית ספציפי באמצעות קוד גישה.
 * POST /api/home/login
 */
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

/**
 * יצירת בית חדש עם אתחול מלא של כל הנתונים, כולל משתמש ראשוני כ-admin.
 * POST /api/home
 */
const createHome = async (req, res) => {
    const { name, accessCode, iconClass, colorClass, users, currency } = req.body; // שימוש ב-colorClass 

    if (!name || !accessCode) {
        return res.status(400).json({ message: 'Name and access code are required' });
    }
    if (!users || !Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: 'At least one user is required to create a home.' });
    }

    try {
        const homeExists = await Home.findOne({ name });
        if (homeExists) {
            return res.status(400).json({ message: 'A home with this name already exists.' });
        }

        // וודא שפורמט המשתמשים הוא אובייקט עם name ו-isAdmin
        const formattedUsers = users.map(user => {
            if (typeof user === 'string') {
                return { name: user, isAdmin: false };
            }
            return { name: user.name, isAdmin: user.isAdmin || false };
        });

        // הגדר את המשתמש הראשון כ-admin
        if (formattedUsers.length > 0) {
            formattedUsers[0].isAdmin = true;
        }

        const newHome = new Home({
            name,
            accessCode,
            iconClass: iconClass || 'fas fa-home',
            colorClass: colorClass || 'card-color-1',
            currency: currency || 'ILS', // שימוש ב-currency הראשי מה-HomeSchema 
            users: formattedUsers,
            shoppingList: [],
            tasks: [],
            templates: [],
            finances: {
                expectedBills: [],
                paidBills: [],
                income: [],
                savingsGoals: [],
                expenseCategories: defaultExpenseCategories, // שימוש במערך ברירת המחדל המלא 
                financeSettings: { currency: currency || 'ש"ח' } // המטבע בתוך financeSettings 
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

/**
 * הוספת פריט לרשימה (קניות או משימות)
 * POST /api/home/:homeId/:listType
 * @param {string} homeId - ה-ID של הבית.
 * @param {'shoppingList'|'tasks'} listType - סוג הרשימה.
 * @param {object} req.body - נתוני הפריט. השדה 'text' נדרש.
 */
const addItemToList = async (req, res) => {
    const { homeId, listType } = req.params;
    const { text, ...otherItemData } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Item text is required.' });
    }
    // וודא ש-listType חוקי וקיים במודל הבית
    if (!['shoppingList', 'tasks'].includes(listType)) {
        return res.status(400).json({ message: 'Invalid list type. Must be "shoppingList" or "tasks".' });
    }

    const newItem = {
        text, // ItemSchema משתמש ב'text' 
        ...otherItemData
    };

    try {
        // שימוש בפעולה אטומית $push להוספה יעילה.
        const updatedHome = await Home.findByIdAndUpdate(
            homeId,
            { $push: { [listType]: newItem } },
            { new: true, runValidators: true } // runValidators מבטיח ש-newItem תקין לפי ItemSchema 
        );

        if (!updatedHome) {
            return res.status(404).json({ message: 'Home not found' });
        }

        // החזרת הפריט שנוסף (הפריט האחרון ברשימה שנוצרה)
        const list = updatedHome[listType];
        res.status(201).json(list[list.length - 1]);

    } catch (error) {
        handleError(res, error, `Failed to add item to ${listType}`);
    }
};

/**
 * עדכון פריט ברשימה (קניות או משימות)
 * PUT /api/home/:homeId/:listType/:itemId
 * @param {string} homeId - ה-ID של הבית.
 * @param {'shoppingList'|'tasks'} listType - סוג הרשימה.
 * @param {string} itemId - ה-ID של הפריט לעדכון.
 * @param {object} req.body - הנתונים לעדכון הפריט.
 */
const updateItemInList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const updates = req.body;

    // וודא ש-listType חוקי
    if (!['shoppingList', 'tasks'].includes(listType)) {
        return res.status(400).json({ message: 'Invalid list type. Must be "shoppingList" or "tasks".' });
    }

    // יצירת אובייקט העדכון עבור MongoDB באמצעות האופרטור הפוזיציונלי '$'
    const updateSet = {};
    for (const key in updates) {
        updateSet[`${listType}.$.${key}`] = updates[key];
    }

    try {
        // שימוש בפעולה אטומית $set לעדכון יעיל.
        const updatedHome = await Home.findOneAndUpdate(
            { _id: homeId, [`${listType}._id`]: itemId },
            { $set: updateSet },
            { new: true, runValidators: true }
        );

        if (!updatedHome) {
            return res.status(404).json({ message: 'Home or item not found' });
        }

        // החזרת הפריט המעודכן
        const updatedItem = updatedHome[listType].find(item => item._id.toString() === itemId);
        res.status(200).json(updatedItem);

    } catch (error) {
        handleError(res, error, `Failed to update item in ${listType}`);
    }
};

/**
 * מחיקת פריט מרשימה (קניות או משימות)
 * DELETE /api/home/:homeId/:listType/:itemId
 * @param {string} homeId - ה-ID של הבית.
 * @param {'shoppingList'|'tasks'} listType - סוג הרשימה.
 * @param {string} itemId - ה-ID של הפריט למחיקה.
 */
const deleteItemFromList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;

    // וודא ש-listType חוקי
    if (!['shoppingList', 'tasks'].includes(listType)) {
        return res.status(400).json({ message: 'Invalid list type. Must be "shoppingList" or "tasks".' });
    }

    try {
        // שימוש בפעולה אטומית $pull להסרה יעילה.
        const updatedHome = await Home.findByIdAndUpdate(
            homeId,
            { $pull: { [listType]: { _id: itemId } } },
            { new: true }
        );

        if (!updatedHome) {
            return res.status(404).json({ message: 'Home not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });

    } catch (error) {
        handleError(res, error, `Failed to delete item from ${listType}`);
    }
};

/**
 * הוספת משתמש לבית.
 * POST /api/home/:homeId/users
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} userName - שם המשתמש להוספה.
 */
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

        // וודא שהמשתמש אינו קיים כבר (לפי שמו)
        if (home.users.some(u => u.name === userName)) {
            return res.status(409).json({ message: 'User with this name already exists in this home.' });
        }

        home.users.push({ name: userName, isAdmin: false }); // הוספה כאובייקט עם isAdmin: false 
        await home.save();
        res.status(201).json(home.users);
    } catch (error) {
        handleError(res, error, 'Error adding user to home');
    }
};

/**
 * הסרת משתמש מבית.
 * DELETE /api/home/:homeId/users
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} userName - שם המשתמש להסרה.
 */
const removeUser = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { userName } = req.body;

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // מצא את האינדקס של המשתמש
        const userIndex = home.users.findIndex(u => u.name === userName);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found in this home.' });
        }
        
        // וודא שאי אפשר למחוק את המשתמש היחיד שנשאר
        if (home.users.length === 1 && home.users[0].name === userName) {
            return res.status(400).json({ message: 'Cannot remove the last user from the home.' });
        }

        // הסר את המשתמש
        home.users.splice(userIndex, 1);
        await home.save();

        res.status(200).json({ users: home.users, message: 'User removed successfully.' });
    } catch (error) {
        handleError(res, error, 'Error removing user from home');
    }
};

// --- ניהול כספים ---

/**
 * הוספת חשבון צפוי (Expected Bill) לבית.
 * POST /api/home/:homeId/finances/expected-bills
 */
const addExpectedBill = async (req, res) => {
    try {
        const { homeId } = req.params;
        const billData = req.body; // כולל: text, amount, dueDate, category, isUrgent, recurring, assignedTo, comment 

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.expectedBills.push(billData);
        await home.save();
        // החזר את הפריט החדש שנוסף (Mongoose מוסיף _id אוטומטית)
        res.status(201).json(home.finances.expectedBills[home.finances.expectedBills.length - 1]);
    } catch (error) {
        handleError(res, error, 'Error adding expected bill');
    }
};

/**
 * עדכון חשבון צפוי (Expected Bill) בבית.
 * PUT /api/home/:homeId/finances/expected-bills/:billId
 */
const updateExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const billData = req.body;

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // שימוש ב-id() של Mongoose לרשימות משנה
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
 * מחיקת חשבון צפוי (Expected Bill) מבית.
 * DELETE /api/home/:homeId/finances/expected-bills/:billId
 */
const deleteExpectedBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // שימוש ב-pull() של Mongoose להסרה
        home.finances.expectedBills.pull({ _id: billId });
        await home.save();
        res.status(200).json({ message: 'Bill deleted successfully.' }); // 200 OK עם הודעה, במקום 204 No Content
    } catch (error) {
        handleError(res, error, 'Error deleting expected bill');
    }
};

/**
 * תשלום חשבון: מעביר חשבון מ-expectedBills ל-paidBills.
 * POST /api/home/:homeId/finances/pay-bill/:billId
 */
const payBill = async (req, res) => {
    try {
        const { homeId, billId } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // מציאת החשבון המצופה
        const billToPay = home.finances.expectedBills.id(billId);
        if (!billToPay) return res.status(404).json({ message: 'Bill not found in expected bills.' });

        // יצירת אובייקט חשבון ששולם עם תאריך תשלום
        const paidBill = { ...billToPay.toObject(), datePaid: new Date() }; // .toObject() חשוב להעתקה נכונה 
        home.finances.paidBills.push(paidBill);

        // הסרת החשבון מרשימת החשבונות הצפויים
        home.finances.expectedBills.pull({ _id: billId });

        await home.save();
        res.status(200).json(home.finances); // החזרת אובייקט הפיננסים המעודכן
    } catch (error) {
        handleError(res, error, 'Error paying bill');
    }
};

/**
 * הוספת הכנסה לבית.
 * POST /api/home/:homeId/finances/income
 */
const addIncome = async (req, res) => {
    try {
        const { homeId } = req.params;
        const incomeData = req.body; // כולל: text, amount, date, recurring, assignedTo, comment 
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.income.push(incomeData); // השדה הוא 'income' 
        await home.save();
        res.status(201).json(home.finances.income[home.finances.income.length - 1]);
    } catch (error) {
        handleError(res, error, 'Error adding income');
    }
};

/**
 * הוספת יעד חיסכון לבית.
 * POST /api/home/:homeId/finances/savings-goals
 */
const addSavingsGoal = async (req, res) => {
    try {
        const { homeId } = req.params;
        const goalData = req.body; // כולל: name, targetAmount, currentAmount 
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.finances.savingsGoals.push(goalData);
        await home.save();
        res.status(201).json(home.finances.savingsGoals[home.finances.savingsGoals.length - 1]);
    } catch (error) {
        handleError(res, error, 'Error adding savings goal');
    }
};

/**
 * הוספת כספים ליעד חיסכון קיים.
 * PATCH /api/home/:homeId/finances/savings-goals/:goalId/add-funds
 */
const addFundsToSavingsGoal = async (req, res) => {
    try {
        const { homeId, goalId } = req.params;
        const { amount } = req.body; // סכום להוספה
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

/**
 * עדכון תקציבי קטגוריות הוצאה.
 * PUT /api/home/:homeId/finances/budgets
 * @param {Array<object>} req.body - מערך של אובייקטי קטגוריה עם name, budgetAmount, icon, color.
 */
const updateBudgets = async (req, res) => {
    try {
        const home = await Home.findById(req.params.homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const updatedCategories = req.body;
        if (!Array.isArray(updatedCategories)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of expense categories.' });
        }

        // כאן ניתן להוסיף לוגיקת ולידציה עבור updatedCategories אם נדרש
        // למשל, לוודא שיש שדות חובה כמו name, ו-budgetAmount הוא מספר.
        // עבור כל קטגוריה שהתקבלה, עדכן או הוסף אותה לרשימת הקטגוריות הקיימת
        const currentCategories = home.finances.expenseCategories.toObject(); // עבודה על עותק כדי למנוע בעיות Mongoose

        updatedCategories.forEach(updatedCat => {
            const existingCatIndex = currentCategories.findIndex(cat => cat.name === updatedCat.name);
            if (existingCatIndex > -1) {
                // עדכן קטגוריה קיימת
                Object.assign(currentCategories[existingCatIndex], {
                    name: updatedCat.name, // נשמור על השם המקורי במקרה של שינוי
                    budgetAmount: typeof updatedCat.budgetAmount === 'number' ? updatedCat.budgetAmount : 0,
                    color: updatedCat.color || defaultExpenseCategories.find(dc => dc.name === updatedCat.name)?.color || '#CCCCCC',
                    icon: updatedCat.icon || defaultExpenseCategories.find(dc => dc.name === updatedCat.name)?.icon || 'fa-tag'
                });
            } else {
                // הוסף קטגוריה חדשה אם היא לא קיימת
                currentCategories.push({
                    name: updatedCat.name,
                    budgetAmount: typeof updatedCat.budgetAmount === 'number' ? updatedCat.budgetAmount : 0,
                    color: updatedCat.color || defaultExpenseCategories.find(dc => dc.name === updatedCat.name)?.color || '#CCCCCC',
                    icon: updatedCat.icon || defaultExpenseCategories.find(dc => dc.name === updatedCat.name)?.icon || 'fa-tag'
                });
            }
        });

        // עדכון הרשימה בבסיס הנתונים
        home.finances.expenseCategories = currentCategories;
        await home.save();
        res.status(200).json(home.finances.expenseCategories);
    } catch (error) {
        handleError(res, error, 'Error updating budgets');
    }
};

/**
 * חישוב סיכום פיננסי חודשי לפי משתמש.
 * GET /api/home/:homeId/finances/summary/:year/:month
 */
const getUserMonthlyFinanceSummary = async (req, res) => {
    try {
        const { homeId, year, month } = req.params;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const numericYear = parseInt(year);
        const numericMonth = parseInt(month); // 1-12 עבור חודש

        // יצירת אובייקטי תאריך לתחילת וסוף החודש
        const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
        const endOfMonth = new Date(numericYear, numericMonth, 0, 23, 59, 59, 999); // סוף היום האחרון בחודש

        // אתחול אובייקט סיכום לכל המשתמשים ול"משותף" 
        // וודא ש"אני" ו"משותף" נכללים ביוזרים הזמינים, וכן שמות המשתמשים מהמודל 
        const allUsers = [...new Set([
            ...(home.users || []).map(u => u.name), // מפתחים את אובייקטי המשתמשים לשמות 
            'אני', // עדיין נכלל לברירת מחדל
            'משותף' // עדיין נכלל לברירת מחדל
        ])];

        const userSummary = {};
        allUsers.forEach(user => {
            userSummary[user] = { income: 0, expenses: 0, net: 0 };
        });

        // צבירת הכנסות לפי משתמש 
        home.finances.income.forEach(inc => {
            const incomeDate = new Date(inc.date);
            if (incomeDate >= startOfMonth && incomeDate <= endOfMonth) {
                const user = inc.assignedTo || 'משותף';
                if (userSummary[user]) { // וודא שהמשתמש קיים בסיכום (אמור להיות אם הוא ב-allUsers)
                    userSummary[user].income += inc.amount;
                }
            }
        });

        // צבירת הוצאות (חשבונות ששולמו) לפי משתמש 
        home.finances.paidBills.forEach(bill => {
            const paidDate = new Date(bill.datePaid);
            if (paidDate >= startOfMonth && paidDate <= endOfMonth) {
                const user = bill.assignedTo || 'משותף';
                if (userSummary[user]) { // וודא שהמשתמש קיים בסיכום
                    userSummary[user].expenses += bill.amount;
                }
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

// --- אינטגרציית Gemini AI (Mocked) ---
/**
 * ממירה מתכון (טקסט) לרשימת קניות ומוסיפה אותה לבית.
 * זוהי פונקציית Mock כרגע.
 * POST /api/home/:homeId/ai/transform-recipe
 */
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

        home.shoppingList.push(...mockShoppingList);
        await home.save();

        res.status(200).json({ message: "Recipe transformed and items added to shopping list!", newItems: mockShoppingList });
    } catch (error) {
        handleError(res, error, 'Error transforming recipe with Gemini');
    }
};

/**
 * מפרקת משימה מורכבת לתת-משימות ומוסיפה אותן לבית.
 * זוהי פונקציית Mock כרגע.
 * POST /api/home/:homeId/ai/breakdown-task
 */
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

        home.tasks.push(...mockSubTasks);
        await home.save();

        res.status(200).json({ message: "Task broken down and sub-tasks added!", newItems: mockSubTasks });
    } catch (error) {
        handleError(res, error, 'Error breaking down task with Gemini');
    }
};

module.exports = {
    getHomes,
    getHomeDetails,
    loginToHome,
    createHome,
    addItemToList, // שם מעודכן
    updateItemInList, // שם מעודכן
    deleteItemFromList, // שם מעודכן
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