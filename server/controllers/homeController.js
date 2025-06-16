const Home = require('../models/Home');

// Home Handlers
const getHomes = async (req, res) => {
    try {
        const homes = await Home.find({});
        res.status(200).json(homes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createHome = async (req, res) => {
    try {
        const home = new Home({ name: req.body.name });
        const createdHome = await home.save();
        res.status(201).json(createdHome);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateHome = async (req, res) => {
    try {
        const home = await Home.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteHome = async (req, res) => {
    try {
        await Home.findByIdAndDelete(req.params.id);
        res.json({ message: 'Home removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Task Handlers
const createTask = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        home.tasks.push({ name: req.body.name });
        await home.save();
        res.status(201).json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        const task = home.tasks.id(req.params.taskId);
        task.set(req.body);
        await home.save();
        res.json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Shopping Item Handlers
const createShoppingItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        home.shoppingList.push({ name: req.body.name });
        await home.save();
        res.status(201).json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateShoppingItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        const item = home.shoppingList.id(req.params.itemId);
        item.set(req.body);
        await home.save();
        res.json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Sub-Item Handlers
const createSubItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        const item = home.shoppingList.id(req.params.itemId);
        item.subItems.push({ name: req.body.name });
        await home.save();
        res.status(201).json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateSubItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        const item = home.shoppingList.id(req.params.itemId);
        const subItem = item.subItems.id(req.params.subItemId);
        subItem.set(req.body);
        await home.save();
        res.json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteSubItem = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        const item = home.shoppingList.id(req.params.itemId);
        item.subItems.id(req.params.subItemId).deleteOne();
        await home.save();
        res.json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Finance Handler
const updateFinance = async (req, res) => {
    try {
        const home = await Home.findById(req.params.id);
        home.finance = { ...home.finance, ...req.body };
        await home.save();
        res.json(home);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getHomes, createHome, updateHome, deleteHome,
    createTask, updateTask,
    createShoppingItem, updateShoppingItem,
    createSubItem, updateSubItem, deleteSubItem,
    updateFinance,
};
