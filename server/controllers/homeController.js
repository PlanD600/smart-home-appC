const Home = require('../models/Home');

/**
 * @file homeController.js
 * @description Controller functions for managing home data, including creation, retrieval,
 * and updates of nested fields like shopping items, tasks, finances, and templates.
 */

// פונקציית עזר לטיפול בשגיאות ושליחת תגובה אחידה
const sendErrorResponse = (res, message, statusCode = 500) => {
  console.error(message);
  res.status(statusCode).json({ message: message });
};

/**
 * @route POST /api/homes
 * @description Create a new home
 * @access Public (or authenticated for real apps)
 */
exports.createHome = async (req, res) => {
  try {
    const { name, accessCode, iconClass, colorClass, members, users, shoppingItems, taskItems, shoppingCategories, taskCategories, templates, archivedShopping, archivedTasks, finances } = req.body;

    // ולידציה בסיסית
    if (!name || !accessCode) {
      return sendErrorResponse(res, 'שם וקוד כניסה נדרשים.', 400);
    }

    const newHome = new Home({
      name,
      accessCode,
      iconClass,
      colorClass,
      // ודא ששדות המערך מוגדרים כברירת מחדל אם לא נשלחו
      members: members || [],
      users: users || ["אני"], // Ensure default user is set if not provided
      shoppingItems: shoppingItems || [],
      taskItems: taskItems || [],
      shoppingCategories: shoppingCategories || ["כללית"],
      taskCategories: taskCategories || ["כללית"],
      templates: templates || [],
      archivedShopping: archivedShopping || [],
      archivedTasks: archivedTasks || [],
      // Finance field will be initialized by the client if it's missing or needs defaults
      finances: finances || { // Provide a default empty structure if nothing is sent
        income: [],
        expectedBills: [],
        paidBills: [],
        expenseCategories: [],
        savingsGoals: [],
        financeSettings: { currency: "₪" }
      }
    });

    const savedHome = await newHome.save();
    res.status(201).json(savedHome);
  } catch (error) {
    sendErrorResponse(res, `שגיאה ביצירת בית: ${error.message}`);
  }
};

/**
 * @route GET /api/homes
 * @description Get all homes (for a specific user/member - simplified for now)
 * @access Public (or authenticated for real apps)
 *
 * NOTE: In a real app, this should typically return homes specific to the authenticated user.
 * For this example, it might return all homes or require a member ID in query.
 */
exports.getHomes = async (req, res) => {
  try {
    // אם היה אימות, היינו שולפים בתים לפי req.user.id
    // מכיוון שאין אימות מלא, נחזיר את כל הבתים או נחפש לפי userId בקווארי
    // לצורך הדגמה, נחזיר את כל הבתים עם לפחות משתמש אחד
    const homes = await Home.find({ 'members.0': { '$exists': true } }); // Filter out homes with no members if needed
    res.status(200).json(homes);
  } catch (error) {
    sendErrorResponse(res, `שגיאה באחזור בתים: ${error.message}`);
  }
};

/**
 * @route GET /api/homes/:id
 * @description Get a single home by ID
 * @access Public (or authenticated for real apps)
 */
exports.getHomeById = async (req, res) => {
  try {
    const home = await Home.findById(req.params.id);
    if (!home) {
      return sendErrorResponse(res, 'בית לא נמצא.', 404);
    }
    res.status(200).json(home);
  } catch (error) {
    sendErrorResponse(res, `שגיאה באחזור בית: ${error.message}`);
  }
};

/**
 * @route PUT /api/homes/:id
 * @description Update a home by ID (including nested data)
 * @access Public (or authenticated)
 *
 * This function is designed to handle updates to top-level fields AND
 * updates to nested arrays/objects (like shoppingItems, finances, etc.)
 * by completely replacing the updated part of the document.
 * For granular updates within arrays (e.g., updating one item in shoppingItems),
 * more specific Mongoose operators ($set, $push, $pull) would be needed,
 * or the client sends the full updated array. Here we assume the client
 * sends the full updated array for simplicity.
 */
exports.updateHome = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Client sends the updated fields

    // Mongoose findByIdAndUpdate automatically merges top-level fields.
    // For nested arrays/objects, we need to ensure the entire updated array/object
    // is sent from the client if we want to replace it.
    // If only parts of nested objects are sent, Mongoose's default behavior
    // will replace the whole nested object unless specific dot notation is used.
    // Here, we trust the client to send the correct structure for updates.

    const updatedHome = await Home.findByIdAndUpdate(
      id,
      { $set: updates }, // Use $set to explicitly update the fields provided in 'updates'
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedHome) {
      return sendErrorResponse(res, 'בית לא נמצא לעדכון.', 404);
    }

    res.status(200).json(updatedHome);
  } catch (error) {
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return sendErrorResponse(res, `שגיאת ולידציה: ${error.message}`, 400);
    }
    sendErrorResponse(res, `שגיאה בעדכון בית: ${error.message}`);
  }
};

/**
 * @route DELETE /api/homes/:id
 * @description Delete a home by ID
 * @access Public (or authenticated)
 */
exports.deleteHome = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHome = await Home.findByIdAndDelete(id);

    if (!deletedHome) {
      return sendErrorResponse(res, 'בית לא נמצא למחיקה.', 404);
    }

    res.status(200).json({ message: 'הבית נמחק בהצלחה.' });
  } catch (error) {
    sendErrorResponse(res, `שגיאה במחיקת בית: ${error.message}`);
  }
};
