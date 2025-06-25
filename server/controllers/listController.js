const Home = require('../models/Home');
const {
    handleError,
    getListKey,
    filterCompleted,
    normalizeHomeObject,
    mongoose
} = require('../utils/controllerUtils');

// --- Helper Functions for this Controller ---

function findItemAndParent(items, itemId) {
    for (const item of items) {
        if (item._id && item._id.toString() === itemId) {
            return { item, parentArray: items };
        }
        if (item.subItems && item.subItems.length > 0) {
            const found = findItemAndParent(item.subItems, itemId);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

function findItem(items, itemId) {
    for (const item of items) {
        if (item._id && item._id.toString() === itemId) {
            return item;
        }
        if (item.subItems && item.subItems.length > 0) {
            const found = findItem(item.subItems, itemId);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

const findAndUpdateItem = (items, itemId, updates) => {
    for (const item of items) {
        if (item._id && item._id.toString() === itemId) {
            Object.assign(item, updates);
            return item;
        }
        if (item.subItems && item.subItems.length > 0) {
            const updatedSubItem = findAndUpdateItem(item.subItems, itemId, updates);
            if (updatedSubItem) return updatedSubItem;
        }
    }
    return null;
};

// --- Controller Functions ---

const addItemToList = async (req, res) => {
    const { homeId, listType } = req.params;
    const itemData = req.body;
    const listKey = getListKey(listType);
    if (!listKey) return res.status(400).json({ message: 'Invalid list type provided.' });
    if (!itemData.text) return res.status(400).json({ message: 'Item text is required.' });

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
        res.status(201).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, `Failed to add item to ${listType}`);
    }
};

const updateItemInList = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const updates = req.body;
    const listKey = getListKey(listType);
    if (!listKey) return res.status(400).json({ message: 'Invalid list type provided.' });

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        const updatedItem = findAndUpdateItem(home[listKey], itemId, updates);
        if (!updatedItem) return res.status(404).json({ message: 'Item not found.' });
        await home.save();
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, `Failed to update item in ${listType}`);
    }
};

const groupItems = async (req, res) => {
    const { homeId, listType } = req.params;
    const { draggedItemId, targetItemId, newFolderName } = req.body;
    const listKey = getListKey(listType);

    if (!listKey || !draggedItemId || !targetItemId || !newFolderName || draggedItemId === targetItemId) {
        return res.status(400).json({ message: 'Invalid request for grouping items.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const draggedResult = findItemAndParent(home[listKey], draggedItemId);
        if (!draggedResult) return res.status(404).json({ message: 'Dragged item not found.' });
        
        const { item: draggedItem, parentArray: draggedItemParent } = draggedResult;

        const targetItem = findItem(home[listKey], targetItemId);
        if (!targetItem) return res.status(404).json({ message: 'Target item not found.' });
        
        if (findItem([draggedItem], targetItemId)) {
             return res.status(400).json({ message: 'Cannot move an item into one of its own sub-items.' });
        }

        const itemIndex = draggedItemParent.findIndex(it => it._id.toString() === draggedItemId);
        if(itemIndex > -1) {
            draggedItemParent.splice(itemIndex, 1);
        }
        
        targetItem.text = newFolderName;
        targetItem.subItems = targetItem.subItems || [];
        targetItem.subItems.push(draggedItem);
        
        await home.save();
        res.status(200).json(normalizeHomeObject(home));

    } catch (error) {
        handleError(res, error, 'Failed to group items.');
    }
};

const unGroupFolder = async (req, res) => {
    const { homeId, listType } = req.params;
    const { folderId } = req.body;
    const listKey = getListKey(listType);

    if (!listKey || !folderId) {
        return res.status(400).json({ message: 'Invalid request for ungrouping.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const folderItem = findItem(home[listKey], folderId);
        if (!folderItem || !folderItem.subItems) {
            return res.status(404).json({ message: 'Folder not found or has no sub-items.' });
        }

        const itemsToMove = [...folderItem.subItems];
        folderItem.subItems = [];

        home[listKey].push(...itemsToMove);

        await home.save();
        res.status(200).json(normalizeHomeObject(home));

    } catch(error) {
        handleError(res, error, 'Failed to ungroup folder.');
    }
};

const deleteItemPermanently = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const listKey = getListKey(listType);
    if (!listKey) return res.status(400).json({ message: 'Invalid list type.' });

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        
        const result = findItemAndParent(home[listKey], itemId);
        
        if (result) {
            const { item, parentArray } = result;
            const itemIndex = parentArray.findIndex(it => it._id.toString() === item._id.toString());
            parentArray.splice(itemIndex, 1);

            await home.save();
            res.status(200).json(normalizeHomeObject(home));
        } else {
            res.status(404).json({ message: 'Item not found.' });
        }
    } catch (error) {
        handleError(res, error, `Failed to permanently delete item from ${listType}.`);
    }
};

const clearList = async (req, res) => {
    const { homeId, listType } = req.params;
    const listKey = getListKey(listType);
    if (!listKey) return res.status(400).json({ message: 'Invalid list type.' });
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

const clearCompletedItems = async (req, res) => {
    const { homeId, listType } = req.params;
    const listKey = getListKey(listType);
    if (!listKey) return res.status(400).json({ message: 'Invalid list type provided.' });

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
    groupItems,
    unGroupFolder,
    clearCompletedItems,
    deleteItemPermanently,
    clearList,
};
