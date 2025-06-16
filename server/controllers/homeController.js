/**
 * homeController.js
 * * קובץ זה מרכז את כל הלוגיקה העסקית והפעולות הקשורות לניהול 'בתים' באפליקציה.
 * כל פונקציה כאן אחראית על טיפול בבקשת API ספציפית, החל מיצירת בית חדש,
 * דרך ניהול פריטים, משתמשים, תקציבים, ועד לאינטראקציות עתידיות עם AI.
 */

// ייבוא מודל הבית, המגדיר את הסכמה של מסמך 'בית' במסד הנתונים.
const Home = require('../models/Home');

// אובייקט שיכיל את כל הפונקציות וייוצא בסוף הקובץ.
const homeController = {

    // ===============================================
    // 1. ניהול בתים ואימות (Home & Auth)
    // ===============================================

    /**
     * @desc אחזור רשימה של כל הבתים הקיימים עם פרטים ציבוריים בלבד.
     * @route GET /api/homes
     * @access Public
     */
    getHomes: async (req, res) => {
        try {
            // מאחזרים רק את השדות הדרושים למסך הכניסה כדי למנוע חשיפת מידע רגיש.
            const homes = await Home.find().select('name iconClass colorClass');
            res.status(200).json(homes);
        } catch (error) {
            console.error('Error in getHomes:', error);
            res.status(500).json({ message: 'שגיאת שרת פנימית' });
        }
    },

    /**
     * @desc יצירת בית חדש במסד הנתונים.
     * @route POST /api/homes
     * @access Public
     */
    createHome: async (req, res) => {
        try {
            const { name, accessCode, createdBy, iconClass, colorClass, users } = req.body;

            // ערכי ברירת מחדל לבית חדש, כולל קטגוריות התחלתיות.
            const newHome = new Home({
                name,
                accessCode, // חשוב להצפין קוד זה בסביבת פרודקשן
                createdBy,
                iconClass,
                colorClass,
                users,
                shoppingCategories: ['מזון', 'ניקיון', 'פארם', 'כללי'],
                taskCategories: ['בית', 'סידורים', 'ילדים', 'רכב'],
                // ניתן להוסיף כאן ערכים התחלתיים נוספים
            });

            const savedHome = await newHome.save();
            res.status(201).json(savedHome);
        } catch (error) {
            console.error('Error in createHome:', error);
            res.status(500).json({ message: 'שגיאה ביצירת הבית' });
        }
    },

    /**
     * @desc אימות כניסה לבית קיים באמצעות קוד גישה.
     * @route POST /api/homes/login
     * @access Public
     */
    loginHome: async (req, res) => {
        try {
            const { homeId, accessCode } = req.body;
            const home = await Home.findById(homeId);

            if (!home) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }

            // בסביבת פרודקשן, יש להשוות hash של קוד הגישה ולא את הקוד עצמו.
            if (home.accessCode !== accessCode) {
                return res.status(401).json({ message: 'קוד הגישה שגוי' });
            }

            // אם האימות הצליח, מחזירים את כל נתוני הבית.
            res.status(200).json(home);
        } catch (error) {
            console.error('Error in loginHome:', error);
            res.status(500).json({ message: 'שגיאת שרת פנימית' });
        }
    },

    /**
     * @desc אחזור כל המידע על בית ספציפי.
     * @route GET /api/homes/:id
     * @access Private (דורש אימות)
     */
    getHomeData: async (req, res) => {
        try {
            const { id } = req.params;
            const home = await Home.findById(id);

            if (!home) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }

            res.status(200).json(home);
        } catch (error) {
            console.error('Error in getHomeData:', error);
            res.status(500).json({ message: 'שגיאת שרת פנימית' });
        }
    },


    // ===============================================
    // 2. ניהול פריטים גנרי (קניות ומטלות)
    // ===============================================

    /**
     * @desc הוספת פריט חדש לרשימה ספציפית (קניות או מטלות).
     * @route POST /api/homes/:id/:itemType
     * @access Private
     */
    addItem: async (req, res) => {
        try {
            const { id, itemType } = req.params;
            const itemData = req.body;
            
            // $push מאפשר להוסיף פריט למערך קיים במסמך.
            const updatedHome = await Home.findByIdAndUpdate(
                id,
                { $push: { [itemType]: itemData } },
                { new: true, runValidators: true } // מחזיר את המסמך המעודכן ומריץ ולידציות
            );

            if (!updatedHome) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }
            res.status(201).json(updatedHome);
        } catch (error) {
            console.error(`Error in addItem for ${req.params.itemType}:`, error);
            res.status(500).json({ message: 'שגיאה בהוספת הפריט' });
        }
    },

    /**
     * @desc עדכון פריט קיים ברשימה ספציפית.
     * @route PUT /api/homes/:id/:itemType/:itemId
     * @access Private
     */
    updateItem: async (req, res) => {
        try {
            const { id, itemType, itemId } = req.params;
            const updatedFields = req.body;
            const home = await Home.findById(id);

            if (!home) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }

            const list = home[itemType];
            const itemIndex = list.findIndex(item => item._id.toString() === itemId);

            if (itemIndex === -1) {
                return res.status(404).json({ message: 'הפריט לא נמצא' });
            }

            // מעדכנים את האובייקט הקיים עם השדות החדשים.
            // השימוש ב-Object.assign מבטיח ששדות שלא נשלחו לא יידרסו.
            const updatedItem = Object.assign(list[itemIndex], updatedFields);
            home[itemType].set(itemIndex, updatedItem);

            await home.save();
            res.status(200).json(home);
        } catch (error) {
            console.error(`Error in updateItem for ${req.params.itemType}:`, error);
            res.status(500).json({ message: 'שגיאה בעדכון הפריט' });
        }
    },

    /**
     * @desc מחיקת פריט מרשימה ספציפית.
     * @route DELETE /api/homes/:id/:itemType/:itemId
     * @access Private
     */
    deleteItem: async (req, res) => {
        try {
            const { id, itemType, itemId } = req.params;

            // $pull מאפשר למחוק פריט ממערך לפי תנאי.
            const updatedHome = await Home.findByIdAndUpdate(
                id,
                { $pull: { [itemType]: { _id: itemId } } },
                { new: true }
            );

            if (!updatedHome) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }
            res.status(200).json(updatedHome);
        } catch (error) {
            console.error(`Error in deleteItem for ${req.params.itemType}:`, error);
            res.status(500).json({ message: 'שגיאה במחיקת הפריט' });
        }
    },

    // ===============================================
    // 3. ניהול ארכיון
    // ===============================================
    
    /**
     * @desc העברת פריט מהרשימה הפעילה לארכיון.
     * @route POST /api/homes/:id/:itemType/:itemId/archive
     * @access Private
     */
    archiveItem: async (req, res) => {
        try {
            const { id, itemType, itemId } = req.params;
            const home = await Home.findById(id);

            if (!home) return res.status(404).json({ message: 'הבית לא נמצא' });

            const sourceArray = home[itemType];
            const itemToArchive = sourceArray.find(item => item._id.toString() === itemId);

            if (!itemToArchive) return res.status(404).json({ message: 'הפריט לא נמצא' });

            const archiveType = itemType === 'shoppingItems' ? 'archivedShopping' : 'archivedTasks';
            
            // שימוש ב-Session/Transaction היה אידיאלי כאן כדי להבטיח אטומיות.
            // ללא Transaction, נבצע את הפעולות אחת אחרי השנייה.
            home[archiveType].push(itemToArchive); // הוספה לארכיון
            home[itemType] = sourceArray.filter(item => item._id.toString() !== itemId); // הסרה מהרשימה הפעילה

            await home.save();
            res.status(200).json(home);
        } catch (error) {
            console.error(`Error in archiveItem for ${req.params.itemType}:`, error);
            res.status(500).json({ message: 'שגיאה בהעברה לארכיון' });
        }
    },

    /**
     * @desc שחזור פריט מהארכיון לרשימה הפעילה.
     * @route POST /api/homes/:id/:archiveType/:itemId/restore
     * @access Private
     */
    restoreItem: async (req, res) => {
        try {
            const { id, archiveType, itemId } = req.params;
            const home = await Home.findById(id);

            if (!home) return res.status(404).json({ message: 'הבית לא נמצא' });

            const sourceArchive = home[archiveType];
            const itemToRestore = sourceArchive.find(item => item._id.toString() === itemId);

            if (!itemToRestore) return res.status(404).json({ message: 'הפריט לא נמצא בארכיון' });

            const destinationType = archiveType === 'archivedShopping' ? 'shoppingItems' : 'tasks';

            home[destinationType].push(itemToRestore); // הוספה לרשימה הפעילה
            home[archiveType] = sourceArchive.filter(item => item._id.toString() !== itemId); // הסרה מהארכיון

            await home.save();
            res.status(200).json(home);
        } catch (error) {
            console.error(`Error in restoreItem for ${req.params.archiveType}:`, error);
            res.status(500).json({ message: 'שגיאה בשחזור הפריט' });
        }
    },

    /**
     * @desc מחיקת פריט לצמיתות מהארכיון.
     * @route DELETE /api/homes/:id/:archiveType/:itemId
     * @access Private
     */
    deleteArchivedItem: async (req, res) => {
        try {
            const { id, archiveType, itemId } = req.params;

            const updatedHome = await Home.findByIdAndUpdate(
                id,
                { $pull: { [archiveType]: { _id: itemId } } },
                { new: true }
            );

            if (!updatedHome) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }
            res.status(200).json(updatedHome);
        } catch (error) {
            console.error(`Error in deleteArchivedItem for ${req.params.archiveType}:`, error);
            res.status(500).json({ message: 'שגיאה במחיקת פריט מהארכיון' });
        }
    },

    // ===============================================
    // 4. ניהול תת-פריטים
    // ===============================================

    addSubItem: async (req, res) => {
        // לוגיקה להוספת תת-פריט
        res.status(501).json({ message: 'Not Implemented' });
    },

    updateSubItem: async (req, res) => {
        // לוגיקה לעדכון תת-פריט
        res.status(501).json({ message: 'Not Implemented' });
    },

    deleteSubItem: async (req, res) => {
        // לוגיקה למחיקת תת-פריט
        res.status(501).json({ message: 'Not Implemented' });
    },

    // ===============================================
    // 5. ניהול קטגוריות
    // ===============================================
    
    /**
     * @desc הוספת קטגוריה חדשה לרשימת הקטגוריות.
     * @route POST /api/homes/:id/:categoryType/categories
     * @access Private
     */
    addCategory: async (req, res) => {
        try {
            const { id, categoryType } = req.params; // categoryType: 'shoppingCategories' או 'taskCategories'
            const { name } = req.body;

            // $addToSet מוסיף את הערך למערך רק אם הוא לא קיים כבר.
            const updatedHome = await Home.findByIdAndUpdate(
                id,
                { $addToSet: { [categoryType]: name } },
                { new: true }
            );

            if (!updatedHome) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }
            res.status(201).json(updatedHome);
        } catch (error) {
            console.error(`Error in addCategory for ${req.params.categoryType}:`, error);
            res.status(500).json({ message: 'שגיאה בהוספת הקטגוריה' });
        }
    },

    // ===============================================
    // 6. ניהול משתמשים
    // ===============================================
    
    /**
     * @desc הוספת משתמש חדש לבית.
     * @route POST /api/homes/:id/users
     * @access Private
     */
    addUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const updatedHome = await Home.findByIdAndUpdate(
                id,
                { $addToSet: { users: name } },
                { new: true }
            );

            if (!updatedHome) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }
            res.status(201).json(updatedHome);
        } catch (error) {
            console.error('Error in addUser:', error);
            res.status(500).json({ message: 'שגיאה בהוספת המשתמש' });
        }
    },

    /**
     * @desc הסרת משתמש מהבית ושיוך מחדש של הפריטים שלו.
     * @route DELETE /api/homes/:id/users
     * @access Private
     */
    removeUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body; // שם המשתמש להסרה
            const sharedUser = "משותף"; // המשתמש אליו ישויכו הפריטים

            const home = await Home.findById(id);
            if (!home) {
                return res.status(404).json({ message: 'הבית לא נמצא' });
            }

            // שיוך מחדש של פריטי קניות
            home.shoppingItems.forEach(item => {
                if (item.assignedTo === name) {
                    item.assignedTo = sharedUser;
                }
            });

            // שיוך מחדש של מטלות
            home.tasks.forEach(task => {
                if (task.assignedTo === name) {
                    task.assignedTo = sharedUser;
                }
            });

            // הסרת המשתמש מרשימת המשתמשים
            home.users = home.users.filter(user => user !== name);

            await home.save();
            res.status(200).json(home);
        } catch (error) {
            console.error('Error in removeUser:', error);
            res.status(500).json({ message: 'שגיאה בהסרת המשתמש' });
        }
    },

    // ===============================================
    // 7. ניהול תבניות
    // ===============================================

    createTemplate: async (req, res) => {
        res.status(501).json({ message: 'Not Implemented' });
    },

    updateTemplate: async (req, res) => {
        res.status(501).json({ message: 'Not Implemented' });
    },

    deleteTemplate: async (req, res) => {
        res.status(501).json({ message: 'Not Implemented' });
    },


    // ===============================================
    // 8. ניהול כספים
    // ===============================================
    payBill: async (req, res) => {
        res.status(501).json({ message: 'Not Implemented' });
    },
    updateBudgets: async (req, res) => {
        res.status(501).json({ message: 'Not Implemented' });
    },

    // ===============================================
    // 9. עוזר AI
    // ===============================================

    /**
     * @desc יצירת רשימה על בסיס טקסט חופשי באמצעות AI.
     * @desc כרגע מחזיר רשימת דמה (mock).
     * @route POST /api/ai/generate-list
     * @access Private
     */
    generateListFromAI: async (req, res) => {
        try {
            const { prompt } = req.body;
            console.log(`AI prompt received: ${prompt}`);

            // כאן תהיה קריאה עתידית ל-API של מודל שפה.
            // כרגע, מחזירים רשימת דמה לדוגמה.
            const mockResponse = {
                listName: "קניות למסיבה",
                items: [
                    { text: "חטיפים מלוחים", category: "מזון" },
                    { text: "שתייה קלה", category: "מזון" },
                    { text: "כלים חד פעמיים", category: "כללי" },
                    { text: "בלונים וקישוטים", category: "כללי" }
                ]
            };
            
            res.status(200).json(mockResponse);

        } catch (error) {
            console.error('Error in generateListFromAI:', error);
            res.status(500).json({ message: 'שגיאה בעיבוד הבקשה מה-AI' });
        }
    },
};


// ייצוא כל הפונקציות שהוגדרו באובייקט homeController
module.exports = homeController;
