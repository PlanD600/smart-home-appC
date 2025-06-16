// server/controllers/homeController.js

const Home = require('../models/Home');

// @desc    Get all homes
// @route   GET /api/homes
const getHomes = async (req, res) => {
    try {
        const homes = await Home.find({});
        res.json(homes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new home
// @route   POST /api/homes
const createHome = async (req, res) => {
    try {
        const { name, accessCode, iconClass, colorClass } = req.body;
        const newHome = new Home({
            name,
            accessCode,
            iconClass,
            colorClass
        });
        const savedHome = await newHome.save();
        res.status(201).json(savedHome);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single home by ID
// @route   GET /api/homes/:id
const getHomeById = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        if (home) {
            res.json(home);
        } else {
            res.status(404).json({ message: 'Home not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Shopping List Items ---

// @desc    Create a new shopping item
// @route   POST /api/homes/:id/shopping-list
const createShoppingItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        if (home) {
            const newItem = { name: req.body.name };
            home.shoppingItems.push(newItem); // <--- תיקון: shoppingList -> shoppingItems
            await home.save();
            res.status(201).json(home.shoppingItems[home.shoppingItems.length - 1]);
        } else {
            res.status(404).json({ message: 'Home not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a shopping item
// @route   PUT /api/homes/:id/shopping-list/:itemId
const updateShoppingItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        if (home) {
            const item = home.shoppingItems.id(req.params.itemId); // <--- תיקון: shoppingList -> shoppingItems
            if (item) {
                item.set(req.body);
                await home.save();
                res.json(item);
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        } else {
            res.status(404).json({ message: 'Home not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a shopping item
// @route   DELETE /api/homes/:id/shopping-list/:itemId
const deleteShoppingItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        if (home) {
            // The .pull method is a robust way to remove subdocuments in Mongoose
            home.shoppingItems.pull({ _id: req.params.itemId }); // <--- תיקון: shoppingList -> shoppingItems
            await home.save();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Home not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Task List Items ---

// @desc    Create a new task
// @route   POST /api/homes/:id/tasks
const createTask = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        if (home) {
            const newTask = { name: req.body.name };
            home.taskItems.push(newTask); // <--- תיקון: tasks -> taskItems
            await home.save();
            res.status(201).json(home.taskItems[home.taskItems.length - 1]);
        } else {
            res.status(404).json({ message: 'Home not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a task
// @route   PUT /api/homes/:id/tasks/:taskId
const updateTask = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        if (home) {
            const task = home.taskItems.id(req.params.taskId); // <--- תיקון: tasks -> taskItems
            if (task) {
                task.set(req.body);
                await home.save();
                res.json(task);
            } else {
                res.status(404).json({ message: 'Task not found' });
            }
        } else {
            res.status(404).json({ message: 'Home not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/homes/:id/tasks/:taskId
const deleteTask = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        if (home) {
            home.taskItems.pull({ _id: req.params.taskId }); // <--- תיקון: tasks -> taskItems
            await home.save();
            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Home not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    getHomes,
    createHome,
    getHomeById,
    createShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    createTask,
    updateTask,
    deleteTask
};