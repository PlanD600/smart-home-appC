const Home = require('../models/Home');
const { handleError, getListKey, normalizeHomeObject } = require('../utils/controllerUtils');

/**
 * Moves an item from an active list (shopping/tasks) to the archive.
 */
const archiveItem = async (req, res) => {
    const { homeId, listType, itemId } = req.params;
    const listKey = getListKey(listType);

    if (!listKey) {
        return res.status(400).json({ message: 'Invalid list type provided.' });
    }

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        const itemIndex = home[listKey].findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in the list.' });
        }

        const [itemToArchive] = home[listKey].splice(itemIndex, 1);
        itemToArchive.originalList = listType; // Set where it came from

        home.archivedItems.push(itemToArchive);
        await home.save();

        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, `Failed to archive item from ${listType}.`);
    }
};

/**
 * Restores an item from the archive back to its original list.
 */
const restoreItem = async (req, res) => {
    const { homeId, itemId } = req.params;

    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        
        const itemIndex = home.archivedItems.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in archive.' });
        }
        
        const [itemToRestore] = home.archivedItems.splice(itemIndex, 1);
        const originalListKey = getListKey(itemToRestore.originalList);
        
        if (!originalListKey) {
             // Fallback: if original list is unknown, push to tasksList
             home.tasksList.push(itemToRestore);
        } else {
             home[originalListKey].push(itemToRestore);
        }
        
        await home.save();
        res.status(200).json(normalizeHomeObject(home));

    } catch (error) {
        handleError(res, error, 'Failed to restore item.');
    }
};

/**
 * Permanently deletes an item from the archive.
 */
const deleteArchivedItem = async (req, res) => {
    const { homeId, itemId } = req.params;
    try {
        await Home.findByIdAndUpdate(homeId, {
            $pull: { archivedItems: { _id: itemId } }
        });
        res.status(200).json({ message: 'Item permanently deleted.' });
    } catch (error) {
        handleError(res, error, 'Failed to permanently delete item.');
    }
};

/**
 * Clears the entire archive for a home.
 */
const clearArchive = async (req, res) => {
    const { homeId } = req.params;
    try {
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });
        
        home.archivedItems = [];
        await home.save();
        
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Failed to clear archive.');
    }
};


module.exports = {
    archiveItem,
    restoreItem,
    deleteArchivedItem,
    clearArchive,
};
