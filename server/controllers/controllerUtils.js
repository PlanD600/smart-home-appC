const mongoose = require('mongoose');

// --- Helper Functions ---

/**
 * Handles sending uniform error responses to the client.
 * @param {object} res - Express response object.
 * @param {Error} error - The error object.
 * @param {string} defaultMessage - A generic message for unexpected errors.
 * @param {number} statusCode - HTTP status code for the response.
 */
const handleError = (res, error, defaultMessage = 'An error occurred', statusCode = 500) => {
    console.error(error);
    const errorMessage = error.message || defaultMessage;
    res.status(statusCode).json({ message: defaultMessage, error: errorMessage });
};

// Default expense categories definition (including icons and colors)
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
 * Normalizes the home object to ensure a consistent and correct data structure for the client.
 * @param {object} home - The home object from the database.
 * @returns {object|null} - The normalized home object.
 */
const normalizeHomeObject = (home) => {
    if (!home) return null;

    const homeObject = home.toObject ? home.toObject() : { ...home };

    homeObject.users = homeObject.users || [];
    homeObject.shoppingList = homeObject.shoppingList || [];
    homeObject.tasksList = homeObject.tasksList || [];
    homeObject.templates = homeObject.templates || [];
    homeObject.iconClass = homeObject.iconClass || 'fas fa-home';
    homeObject.colorClass = homeObject.colorClass || 'card-color-1';

    homeObject.finances = homeObject.finances || {};
    const { finances } = homeObject;

    finances.expectedBills = finances.expectedBills || [];
    finances.paidBills = finances.paidBills || [];
    finances.income = finances.income || [];
    finances.savingsGoals = finances.savingsGoals || [];
    finances.financeSettings = finances.financeSettings || { currency: 'ש"ח' };

    let categories = finances.expenseCategories || [];
    if (!Array.isArray(categories) || categories.length === 0) {
        categories = [...defaultExpenseCategories];
    } else {
        categories = categories.map(cat => {
            const defaultCat = defaultExpenseCategories.find(dCat => dCat.name === cat.name);
            return {
                ...cat,
                color: cat.color || (defaultCat ? defaultCat.color : '#CCCCCC'),
                icon: cat.icon || (defaultCat ? defaultCat.icon : 'fa-tag'),
            };
        });
    }
    homeObject.finances.expenseCategories = categories;

    return homeObject;
};


/**
 * Recursively finds and removes an item from a nested list.
 * @param {Array} items - The list of items to scan.
 * @param {String} itemId - The ID of the item to delete.
 * @returns {Boolean} - True if the item was found and removed, otherwise false.
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
 * Recursively filters completed items from a nested list.
 * @param {Array} items - The list of items to filter.
 * @returns {Array} - A new list without the completed items.
 */
const filterCompleted = (items) => {
    return items
        .filter(item => !item.completed)
        .map(item => {
            if (item.subItems && item.subItems.length > 0) {
                item.subItems = filterCompleted(item.subItems);
            }
            return item;
        });
};

/**
 * Converts a short list name to its full database key name.
 * @param {string} shortName - "shopping" or "tasks".
 * @returns {string|null} - "shoppingList", "tasksList", or null.
 */
const getListKey = (shortName) => {
    const map = {
        shopping: 'shoppingList',
        tasks: 'tasksList',
    };
    return map[shortName] || null;
};

module.exports = {
    handleError,
    normalizeHomeObject,
    findAndRemoveItem,
    filterCompleted,
    getListKey,
    mongoose,
    defaultExpenseCategories,
};
