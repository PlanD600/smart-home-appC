// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/controllers/homeController.js
const Home = require('../models/Home.js');

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// --- Home Management ---
exports.getHomes = asyncHandler(async (req, res) => {
    const homes = await Home.find({}).select('name iconClass');
    res.json(homes);
});

exports.getHomeById = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) res.json(home);
    else res.status(404).json({ message: 'Home not found' });
});

exports.createHome = asyncHandler(async (req, res) => {
    const { name, accessCode, iconClass } = req.body;
    const homeExists = await Home.findOne({ name });

    if (homeExists) {
        return res.status(400).json({ message: 'Home with this name already exists' });
    }

    const home = new Home({
        name,
        accessCode,
        iconClass: iconClass || 'fas fa-home',
        users: ['Admin']
    });
    const createdHome = await home.save();
    res.status(201).json(createdHome);
});

exports.loginHome = asyncHandler(async (req, res) => {
    const { name, accessCode, iconClass } = req.body;
    const home = await Home.findOne({ name, iconClass });

    if (home && home.accessCode === accessCode) {
        const fullHome = await Home.findById(home._id);
        res.json(fullHome);
    } else {
        res.status(401).json({ message: 'אחד או יותר מהפרטים שהזנת שגויים' });
    }
});


// --- Task Management ---
exports.addTask = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        const task = { name: req.body.name, category: req.body.category || 'כללית' };
        home.taskItems.push(task);
        await home.save();
        res.status(201).json(home.taskItems[home.taskItems.length - 1]);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

exports.updateTask = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    const task = home?.taskItems.id(req.params.taskId);
    if (task) {
        task.set(req.body);
        await home.save();
        res.json(task);
    } else {
        res.status(404).json({ message: 'Task or Home not found' });
    }
});

exports.deleteTask = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        home.taskItems.id(req.params.taskId).deleteOne();
        await home.save();
        res.json({ message: 'Task removed' });
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

// --- Shopping Item Management ---
exports.addShoppingItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        const item = { name: req.body.name, category: req.body.category || 'כללית' };
        home.shoppingItems.push(item);
        await home.save();
        res.status(201).json(home.shoppingItems[home.shoppingItems.length - 1]);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

exports.updateShoppingItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    const item = home?.shoppingItems.id(req.params.itemId);
    if (item) {
        item.set(req.body);
        await home.save();
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item or Home not found' });
    }
});

exports.deleteShoppingItem = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        home.shoppingItems.id(req.params.itemId).deleteOne();
        await home.save();
        res.json({ message: 'Shopping item removed' });
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

// --- User Management ---
exports.addUserToHome = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const home = await Home.findById(req.params.id);
    if (home) {
        if (home.users.includes(username)) {
            return res.status(400).json({ message: 'User already in home' });
        }
        home.users.push(username);
        await home.save();
        res.status(201).json(home);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

exports.removeUserFromHome = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const home = await Home.findById(req.params.id);
    if (home) {
        home.users.pull(username);
        await home.save();
        res.json(home);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

// --- Category Management ---
exports.addCategory = asyncHandler(async (req, res) => {
    const { name, type } = req.body; // type should be 'shopping' or 'task'
    const home = await Home.findById(req.params.id);
    if (home) {
        const categoryArray = type === 'shopping' ? home.shoppingCategories : home.taskCategories;
        if (categoryArray.includes(name)) {
             return res.status(400).json({ message: 'Category already exists' });
        }
        categoryArray.push(name);
        await home.save();
        res.status(201).json(home);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});

// --- Finance Management ---
exports.updateFinances = asyncHandler(async (req, res) => {
    const home = await Home.findById(req.params.id);
    if (home) {
        home.finances = req.body;
        await home.save();
        res.json(home.finances);
    } else {
        res.status(404).json({ message: 'Home not found' });
    }
});