const Home = require('../models/Home');

// Helper function to find a home by ID and handle errors
const findHomeById = async (id, res) => {
    try {
        const home = await Home.findById(id);
        if (!home) {
            if (res) res.status(404).json({ message: 'Home not found' });
            return null;
        }
        return home;
    } catch (error) {
        if (res) res.status(400).json({ message: 'Invalid Home ID format' });
        return null;
    }
};

// --- Home Authentication & Management ---
const loginHome = async (req, res) => {
    const { homeId, accessCode } = req.body;
    if (!homeId || !accessCode) {
        return res.status(400).json({ message: 'Please provide homeId and accessCode' });
    }
    const home = await findHomeById(homeId, res);
    if (home) {
        if (home.accessCode.trim() === accessCode.trim()) {
            res.status(200).json(home);
        } else {
            res.status(401).json({ message: 'Invalid access code' });
        }
    }
};

const getHomes = async (req, res) => {
    try {
        const homes = await Home.find({}).select('name iconClass colorClass');
        res.status(200).json(homes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createHome = async (req, res) => {
    try {
        const { name, accessCode, iconClass, colorClass } = req.body;
        const initialFinances = {
            income: [], expectedBills: [], paidBills: [],
            expenseCategories: [
                { name: "דיור", icon: "fas fa-home", color: "#AED581", budgetAmount: 0 },
                { name: "מזון ומשקאות", icon: "fas fa-utensils", color: "#FFB74D", budgetAmount: 0 },
                { name: "חשבונות", icon: "fas fa-receipt", color: "#4FC3F7", budgetAmount: 0 },
            ],
            savingsGoals: [], financeSettings: { currency: "ש\"ח" }
        };
        const home = new Home({ name, accessCode, iconClass, colorClass, users: ["אני"], shoppingCategories: ["כללית"], taskCategories: ["כללית"], finances: initialFinances });
        const createdHome = await home.save();
        res.status(201).json(createdHome);
    } catch (error) {
        res.status(400).json({ message: 'Error creating home', error: error.message });
    }
};

const getHomeData = async (req, res) => {
    const home = await findHomeById(req.params.id, res);
    if (home) { res.status(200).json(home); }
};

// --- Generic Item Management ---
const addItem = async (req, res) => {
    try {
        const { itemType } = req.params;
        const home = await findHomeById(req.params.id, res);
        if (home) {
            home[itemType].push(req.body);
            await home.save();
            res.status(201).json(home[itemType].slice(-1)[0]);
        }
    } catch (error) {
        res.status(400).json({ message: 'Error adding item', error: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;
        const home = await findHomeById(req.params.id, res);
        if (home) {
            const item = home[itemType].id(itemId);
            if (item) {
                item.set(req.body);
                await home.save();
                res.status(200).json(item);
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;
        const home = await findHomeById(req.params.id, res);
        if (home) {
            home[itemType].pull({ _id: itemId });
            await home.save();
            res.status(200).json({ message: 'Item removed successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
};

// --- Archive & Sub-Item Management etc. ---
const archiveItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;
        const home = await findHomeById(req.params.id, res);
        if (home) {
            const item = home[itemType].id(itemId);
            if (item) {
                const archiveList = itemType === 'shoppingItems' ? 'archivedShopping' : 'archivedTasks';
                home[archiveList].push(item);
                home[itemType].pull({ _id: itemId });
                await home.save();
                res.status(200).json({ message: 'Item archived' });
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Error archiving item', error: error.message });
    }
};

const restoreItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;
        const home = await findHomeById(req.params.id, res);
        if (home) {
            const archiveList = itemType === 'shoppingItems' ? 'archivedShopping' : 'archivedTasks';
            const item = home[archiveList].id(itemId);
            if (item) {
                home[itemType].push(item);
                home[archiveList].pull({ _id: itemId });
                await home.save();
                res.status(200).json(item);
            } else {
                res.status(404).json({ message: 'Item not found in archive' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Error restoring item', error: error.message });
    }
};

const deleteArchivedItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;
        const home = await findHomeById(req.params.id, res);
        if (home) {
            const archiveList = itemType === 'shoppingItems' ? 'archivedShopping' : 'archivedTasks';
            home[archiveList].pull({ _id: itemId });
            await home.save();
            res.status(200).json({ message: 'Archived item permanently deleted' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting archived item', error: error.message });
    }
};

const addCategory = async (req, res) => {
    try {
        const { itemType } = req.params;
        const { categoryName } = req.body;
        const home = await findHomeById(req.params.id, res);
        if (home && categoryName) {
            const categoryListKey = `${itemType}Categories`;
            if (home[categoryListKey] && !home[categoryListKey].includes(categoryName)) {
                home[categoryListKey].push(categoryName);
                await home.save();
            }
            res.status(200).json(home[categoryListKey]);
        } else {
            res.status(400).json({ message: 'Invalid data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error adding category' });
    }
};

const generateListFromAI = async (req, res) => {
    const { text } = req.body;
    try {
        const mockItems = [
            { text: `AI: פריט 1 מתוך "${text.substring(0, 10)}..."`, category: "מהמתכון" },
            { text: `AI: פריט 2 מתוך "${text.substring(0, 10)}..."`, category: "מהמתכון" },
        ];
        res.status(200).json(mockItems);
    } catch (error) {
        res.status(500).json({ message: 'Error in AI generation' });
    }
};


// --- EXPORTING ALL FUNCTIONS ---
module.exports = {
    loginHome, getHomes, createHome, getHomeData,
    addItem, updateItem, deleteItem,
    archiveItem, restoreItem, deleteArchivedItem,
    addCategory,
    generateListFromAI,
    // Placeholders for functions to be fully implemented
    payBill: (req, res) => res.status(501).json({message: "Not Implemented"}),
    updateBudgets: (req, res) => res.status(501).json({message: "Not Implemented"}),
    addUser: (req, res) => res.status(501).json({message: "Not Implemented"}),
    removeUser: (req, res) => res.status(501).json({message: "Not Implemented"}),
    createTemplate: (req, res) => res.status(501).json({message: "Not Implemented"}),
    updateTemplate: (req, res) => res.status(501).json({message: "Not Implemented"}),
    deleteTemplate: (req, res) => res.status(501).json({message: "Not Implemented"}),
    addSubItem: (req, res) => res.status(501).json({message: "Not Implemented"}),
    updateSubItem: (req, res) => res.status(501).json({message: "Not Implemented"}),
    deleteSubItem: (req, res) => res.status(501).json({message: "Not Implemented"}),
};