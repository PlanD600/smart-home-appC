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
 * @param {Array} items - The list of items to search through.
 * @param {string} itemId - The ID of the item to update.
 * @param {object} updates - The updates to apply to the item.
 * @returns {object|null} - The updated item, or null if not found.
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

const deleteItemPermanently = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const listKey = getListKey(listType);
    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        // We use the same recursive helper as it perfectly handles finding and removing the item
        const itemRemoved = findAndRemoveItem(home[listKey], itemId);
        
        if (itemRemoved) {
            await home.save();
            // Since this is a permanent deletion, we send back the updated home object
            res.status(200).json(normalizeHomeObject(home));
        } else {
            res.status(404).json({ message: 'Item not found.' });
        }
    } catch (error) {
        handleError(res, error, `Failed to permanently delete item from ${listType}.`);
    }
};

/**
 * [NEW] Clears all items from a specific list permanently.
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

        home[listKey] = []; // Reset the list to an empty array
        await home.save();

        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, `Failed to clear list ${listType}.`);
    }
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

        const addedItem = home[listKey].id(newItem._id);
        res.status(201).json(addedItem);
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
        res.status(200).json(updatedItem);

    } catch (error) {
        handleError(res, error, `Failed to update item in ${listType}`);
    }
};

/**
 * Deletes an item from a list, including nested items.
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
            // Respond with the updated home object for client-side synchronization
            res.status(200).json(normalizeHomeObject(home)); 
        } else {
            res.status(404).json({ message: 'Item not found in list or sub-items.' });
        }

    } catch (error) {
        handleError(res, error, `Failed to delete item from ${listType}`);
    }
};

/**
 * Deletes all completed items (completed: true) from a list, including sub-tasks.
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


module.exports = {
    addItemToList,
    updateItemInList,
    deleteItemFromList,
    clearCompletedItems,
    deleteItemFromList: deleteItemPermanently,
    clearList,
};
