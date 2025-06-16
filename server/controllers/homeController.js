// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/controllers/homeController.js
const Home = require('../models/Home.js');

// Helper to handle async operations and send response
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// @desc    Get all homes
// @route   GET /api/homes
exports.getHomes = asyncHandler(async (req, res) => {
    const homes = await Home.find({});
    res.json(homes);
});

// @desc    Create a new home
// @route   POST /api/homes
exports.createHome = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const home = new Home({
        name: name || 'My New Home',
        users: ['Admin'],
        // Initialize with default empty structures
        finances: {
            expenseCategories: [
                { name: "דיור", budgetAmount: 0 },
                { name: "מזון ומשקאות", budgetAmount: 0 },
                { name: "חשבונות", budgetAmount: 0 },
            ]
        },
        shoppingCategories: ['כללית'],
        taskCategories: ['כללית']
    });
    const createdHome = await home.save();
    res.status(201).json(createdHome);
});

// @desc    Get a single home by ID
// @route   GET /api/homes/:id
exports.getHomeById = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        res.json(home);
    } else {
        res.status(404);
        throw new Error('Home not found');
    }
});

// @desc    Update a home (generic)
// @route   PUT /api/homes/:id
exports.updateHome = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        // This is a generic updater. The frontend will send the field to update.
        Object.assign(home, req.body);
        const updatedHome = await home.save();
        res.json(updatedHome);
    } else {
        res.status(404);
        throw new Error('Home not found');
    }
});

// @desc    Delete a home
// @route   DELETE /api/homes/:id
exports.deleteHome = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        await home.deleteOne();
        res.json({ message: 'Home removed' });
    } else {
        res.status(404);
        throw new Error('Home not found');
    }
});


// --- TASKS ---
exports.addTask = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        const task = { name: req.body.name, category: req.body.category };
        home.taskItems.push(task);
        await home.save();
        res.status(201).json(home);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

exports.updateTask = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (!home) {
        res.status(404).json({ message: 'Home not found' });
        return;
    }
    const task = home.taskItems.id(req.params.taskId);
    if (task) {
        task.set(req.body);
        await home.save();
        res.json(home);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

// --- SHOPPING ---
exports.addShoppingItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        const item = { name: req.body.name, category: req.body.category };
        home.shoppingItems.push(item);
        await home.save();
        res.status(201).json(home);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

exports.updateShoppingItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (!home) {
        res.status(404).json({ message: 'Home not found' });
        return;
    }
    const item = home.shoppingItems.id(req.params.itemId);
    if (item) {
        item.set(req.body);
        await home.save();
        res.json(home);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// --- SUB-ITEMS ---
exports.addSubItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.homeId);
    if (!home) {
        return res.status(404).json({ message: 'Home not found' });
    }
    const item = home.shoppingItems.id(req.params.itemId);
    if (item) {
        item.subItems.push({ name: req.body.name });
        await home.save();
        res.status(201).json(home);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

exports.updateSubItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.homeId);
    if (!home) {
        return res.status(404).json({ message: 'Home not found' });
    }
    const item = home.shoppingItems.id(req.params.itemId);
    const subItem = item?.subItems.id(req.params.subItemId);
    if (subItem) {
        subItem.set(req.body);
        await home.save();
        res.json(home);
    } else {
        res.status(404).json({ message: 'Sub-item not found' });
    }
});

exports.deleteSubItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.homeId);
    if (!home) {
        return res.status(404).json({ message: 'Home not found' });
    }
    const item = home.shoppingItems.id(req.params.itemId);
    if (item) {
        item.subItems.id(req.params.subItemId).deleteOne(); // Correct way to remove sub-document
        await home.save();
        res.json(home);
    } else {
        res.status(404).json({ message: 'Home or item not found' });
    }
});


// --- FINANCE ---
exports.updateFinance = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        // This allows for deep nested updates using dot notation from the client
        // For example, client can send: { $push: { "finances.income": newIncomeObject } }
        // For simplicity here, we'll merge the finance object.
        Object.assign(home.finances, req.body);
        await home.save();
        res.json(home.finances);
    } else {
         res.status(404).json({ message: 'Home not found' });
    }
});