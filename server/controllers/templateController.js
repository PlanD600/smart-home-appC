const Home = require('../models/Home');
const { handleError, normalizeHomeObject } = require('../utils/controllerUtils');

/**
 * Saves or updates the templates array for a specific home.
 */
const saveTemplates = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { templates } = req.body;

        if (!Array.isArray(templates)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of templates.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        // Overwrite the entire templates array with the new one from the client
        home.templates = templates;
        await home.save();
        
        // Return the full, updated home object so the client can sync its state
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error saving templates');
    }
};

module.exports = {
    saveTemplates,
};
