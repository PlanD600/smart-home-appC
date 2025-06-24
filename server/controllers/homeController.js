const Home = require('../models/Home');
const { handleError, normalizeHomeObject, defaultExpenseCategories } = require('../utils/controllerUtils');

/**
 * Fetches a list of all homes (basic details only).
 * This function might be deprecated or used for an admin panel in the new flow.
 */
const getHomes = async (req, res) => {
    try {
        const homes = await Home.find({}, '_id name iconClass colorClass');
        const normalizedHomes = homes.map(home => normalizeHomeObject(home));
        res.status(200).json(normalizedHomes);
    } catch (error) {
        handleError(res, error, 'Error fetching homes');
    }
};

/**
 * Fetches the full details of a single home.
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
 * [MODIFIED] Logs into a home using its name and access code.
 */
const loginToHome = async (req, res) => {
    try {
        // We now expect 'homeName' instead of 'homeId'
        const { homeName, accessCode } = req.body;
        if (!homeName || !accessCode) {
            return res.status(400).json({ message: 'Home name and access code are required.' });
        }

        // Find the home by its unique name
        const home = await Home.findOne({ name: homeName });

        if (!home) {
            // Use a generic message to prevent revealing which homes exist
            return res.status(401).json({ message: 'Invalid home name or access code.' });
        }

        const isMatch = await home.compareAccessCode(accessCode);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid home name or access code.' });
        }

        const normalizedHome = normalizeHomeObject(home);
        res.status(200).json(normalizedHome);
    } catch (error) {
        handleError(res, error, 'Server error during login', 500);
    }
};

/**
 * [MODIFIED] Creates a new home.
 * Now expects `name`, `accessCode`, and `initialUserName`.
 */
const createHome = async (req, res) => {
    const { name, accessCode, initialUserName, iconClass, colorClass, currency } = req.body;

    if (!name || !accessCode || !initialUserName) {
        return res.status(400).json({ message: 'Home name, access code, and an initial user name are required.' });
    }

    try {
        // --- הבדיקה המקדימה חוזרת להיות המקור היחיד לאמת ---
        const homeExists = await Home.findOne({ name });

        if (homeExists) {
            // אם הבדיקה מצאה בית, נחזיר שגיאה ולא ננסה לשמור
            return res.status(409).json({ message: 'A home with this name already exists. Please choose another name.' });
        }
        
        // אם לא נמצא בית, אפשר ליצור בבטחה
        const initialUser = { name: initialUserName, isAdmin: true };

        const newHome = new Home({
            name,
            accessCode,
            users: [initialUser],
            iconClass: iconClass || 'fas fa-home',
            colorClass: colorClass || 'card-color-1',
            finances: {
                expectedBills: [],
                paidBills: [],
                income: [],
                savingsGoals: [],
                expenseCategories: defaultExpenseCategories,
                financeSettings: { currency: currency || 'ILS' }
            }
        });

        await newHome.save();
        res.status(201).json(normalizeHomeObject(newHome));

    } catch (error) {
        // הבלוק הזה יתפוס רק שגיאות אחרות, לא כפילות
        handleError(res, error, 'Server error creating home');
    }
};

/**
 * Updates a home's general properties.
 */
const updateHome = async (req, res) => {
    try {
        const { homeId } = req.params;
        const updates = req.body;
        
        if (!homeId) {
            return res.status(400).json({ message: 'Home ID is required' });
        }
        
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }
        
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

/**
 * Checks if a home name already exists.
 */
const checkHomeName = async (req, res) => {
    try {
        const { name } = req.query; // נקבל את השם מה-query parameters
        if (!name) {
            return res.status(400).json({ message: 'Name parameter is required.' });
        }
        const home = await Home.findOne({ name });
        res.status(200).json({ exists: !!home }); // נחזיר true אם הבית קיים, אחרת false
    } catch (error) {
        handleError(res, error, 'Error checking home name');
    }
};

module.exports = {
    getHomes,
    getHomeDetails,
    loginToHome,
    createHome,
    updateHome,
    checkHomeName,
};
