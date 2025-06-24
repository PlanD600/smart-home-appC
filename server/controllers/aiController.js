const Home = require('../models/Home');
const { handleError, mongoose, normalizeHomeObject } = require('../utils/controllerUtils');

/**
 * Transforms a recipe text into a shopping list using a (mocked) AI service.
 */

const transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText, currentUser } = req.body;

        if (!recipeText) {
            return res.status(400).json({ message: 'Recipe text is required.' });
        }

        let ingredients = [];

        if (recipeText.trim().toLowerCase() === 'לחם') {
            ingredients = ['500 גרם קמח', '1 כף שמרים יבשים', '1 כף סוכר', '1 כפית מלח', '3 כפות שמן זית', '300 מ"ל מים פושרים'];
        } else {
            ingredients = recipeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        }
        
        const newItems = ingredients.map(ingredient => ({
            _id: new mongoose.Types.ObjectId(),
            text: ingredient,
            category: 'מצרכים מהמתכון',
            completed: false,
            createdBy: currentUser || 'מערכת AI' 
        }));

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        home.shoppingList.push(...newItems);
        await home.save();

        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error transforming recipe');
    }
};

/**
 * Breaks down a complex task into sub-tasks using a (mocked) AI service.
 */
const breakdownComplexTask = async (req, res) => {
    try {
        const { homeId } = req.params;
        // נקבל כעת גם את המשתמש שיצר את הבקשה
        const { taskText, currentUser } = req.body;

        if (!taskText) {
            return res.status(400).json({ message: 'Task text is required.' });
        }

        const mockMainTask = {
            _id: new mongoose.Types.ObjectId(), 
            text: taskText,
            category: "משימה מורכבת",
            isUrgent: true,
            // הוספנו את המשתמש שיצר
            createdBy: currentUser || 'מערכת AI',
            subItems: [ 
                { _id: new mongoose.Types.ObjectId(), text: `שלב א: תכנון (${taskText})`, createdBy: currentUser || 'מערכת AI', completed: false },
                { _id: new mongoose.Types.ObjectId(), text: `שלב ב: ביצוע (${taskText})`, createdBy: currentUser || 'מערכת AI', completed: false },
                { _id: new mongoose.Types.ObjectId(), text: `שלב ג: בדיקות (${taskText})`, createdBy: currentUser || 'מערכת AI', completed: false },
            ]
        };

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.tasksList.push(mockMainTask);
        await home.save();

        // --- תיקון: החזרת אובייקט הבית המלא ---
        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error breaking down task');
    }
};

module.exports = {
    transformRecipeToShoppingList,
    breakdownComplexTask,
};
