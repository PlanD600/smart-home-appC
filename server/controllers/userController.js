const Home = require('../models/Home');
const { handleError } = require('../utils/controllerUtils');

/**
 * Adds a new user to a home.
 */
const addUser = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { userName } = req.body;

        if (!userName) {
            return res.status(400).json({ message: 'User name is required.' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        if (home.users.some(u => u.name === userName)) {
            return res.status(409).json({ message: 'User with this name already exists in this home.' });
        }

        // Add the new user, ensuring they are not an admin by default
        home.users.push({ name: userName, isAdmin: false });
        await home.save();
        
        // Return only the updated users array
        res.status(201).json(home.users);

    } catch (error) {
        handleError(res, error, 'Error adding user to home');
    }
};

/**
 * Removes a user from a home.
 */
const removeUser = async (req, res) => {
    try {
        const { homeId } = req.params;
        // The user to remove should be identified uniquely, e.g., by ID.
        // Assuming userName is passed in the body for now.
        const { userName } = req.body;

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        const userIndex = home.users.findIndex(u => u.name === userName);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found in this home.' });
        }
        
        if (home.users.length === 1) {
            return res.status(400).json({ message: 'Cannot remove the last user from the home.' });
        }
        
        // Prevent removing the last admin if they are the one being removed
        const isRemovingLastAdmin = home.users[userIndex].isAdmin && home.users.filter(u => u.isAdmin).length === 1;
        if (isRemovingLastAdmin) {
             return res.status(400).json({ message: 'Cannot remove the last admin from the home.' });
        }

        home.users.splice(userIndex, 1);
        await home.save();

        // Return the updated users array and a success message
        res.status(200).json({ users: home.users, message: 'User removed successfully.' });
    } catch (error) {
        handleError(res, error, 'Error removing user from home');
    }
};

module.exports = {
    addUser,
    removeUser,
};
