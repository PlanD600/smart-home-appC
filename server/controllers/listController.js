const Home = require('../models/Home');
const {
    handleError,
    getListKey,
    findAndRemoveItem,
    filterCompleted,
    normalizeHomeObject,
    mongoose
} = require('../utils/controllerUtils');

/**
 * Recursively finds and updates an item in a nested list.
 */
const findAndUpdateItem = (items, itemId, updates) => {
    for (const item of items) {
        if (item._id && item._id.toString() === itemId) {
            Object.assign(item, updates);
            return item;
        }
        if (item.subItems && item.subItems.length > 0) {
            const updatedSubItem = findAndUpdateItem(item.subItems, itemId, updates);
            if (updatedSubItem) {
                return updatedSubItem;
            }
        }
    }
    return null;
};

/**
 * Adds a new item to a specific list (shopping or tasks).
 */
const addItemToList = async (req, res) => {
    const { homeId, listType } = req.params;
    const itemData = req.body;
    const listKey = getListKey(listType);

    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided.' });
    }
    if (!itemData.text) {
        return res.status(400).json({ message: 'Item text is required.' });
    }

    const createItemWithIds = (item) => ({
        _id: new mongoose.Types.ObjectId(),
        ...item,
        subItems: item.subItems ? item.subItems.map(createItemWithIds) : [],
    });

    const newItem = createItemWithIds(itemData);

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found' });

        home[listKey].push(newItem);
        await home.save();

        // --- התיקון ---
        // מחזירים את אובייקט הבית המלא והמעודכן
        res.status(201).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, `Failed to add item to ${listType}`);
    }
};

/**
 * Updates an existing item in a list, including nested items.
 */
const updateItemInList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const updates = req.body;
    const listKey = getListKey(listType);

    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        const updatedItem = findAndUpdateItem(home[listKey], itemId, updates);

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found in the list or any sub-lists.' });
        }
        
        await home.save();
        
        // --- התיקון ---
        // מחזירים את אובייקט הבית המלא והמעודכן
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, `Failed to update item in ${listType}`);
    }
};

/**
 * Deletes an item from a list (moves to archive).
 * This function should ideally be in archiveController, but for now we keep the logic here.
 */
const deleteItemFromList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const listKey = getListKey(listType);

    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        const itemRemoved = findAndRemoveItem(home[listKey], itemId);
        
        if (itemRemoved) {
            await home.save();
            res.status(200).json(normalizeHomeObject(home)); 
        } else {
            res.status(404).json({ message: 'Item not found in list or sub-items.' });
        }
    } catch (error) {
        handleError(res, error, `Failed to delete item from ${listType}`);
    }
};


/**
 * Permanently deletes an item from a list.
 */
const deleteItemPermanently = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const listKey = getListKey(listType);
    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const itemRemoved = findAndRemoveItem(home[listKey], itemId);
        
        if (itemRemoved) {
            await home.save();
            res.status(200).json(normalizeHomeObject(home));
        } else {
            res.status(404).json({ message: 'Item not found.' });
        }
    } catch (error) {
        handleError(res, error, `Failed to permanently delete item from ${listType}.`);
    }
};

/**
 * Clears all items from a specific list permanently.
 */
const clearList = async (req, res) => {
    const { homeId, listType } = req.params;
    const listKey = getListKey(listType);
    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home[listKey] = [];
        await home.save();
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, `Failed to clear list ${listType}.`);
    }
};

/**
 * Deletes all completed items from a list.
 */
const clearCompletedItems = async (req, res) => {
    const { homeId, listType } = req.params;
    const listKey = getListKey(listType);

    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found' });
        
        home[listKey] = filterCompleted(home[listKey]);

        await home.save();
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Server Error: Failed to clear completed items.');
    }
};

// ייצוא נקי ותקין של כל הפונקציות
module.exports = {
    addItemToList,
    updateItemInList,
    deleteItemFromList,
    clearCompletedItems,
    deleteItemPermanently,
    clearList,
};