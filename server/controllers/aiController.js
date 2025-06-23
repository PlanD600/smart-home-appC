const Home = require('../models/Home');
const { handleError, mongoose } = require('../utils/controllerUtils');

/**
 * Transforms a recipe text into a shopping list using a (mocked) AI service.
 */
const transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText } = req.body;

        if (!recipeText) {
            return res.status(400).json({ message: 'Recipe text is required.' });
        }
        
        // In a real application, this is where you would call the Gemini API.
        // For now, we use a mock response.
        const mockIngredients = recipeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const newItems = mockIngredients.map(ingredient => ({
            _id: new mongoose.Types.ObjectId(), // Generate a new unique ID
            text: ingredient,
            category: 'מצרכים מהמתכון', // Recipe ingredients category
            completed: false,
            createdAt: new Date()
        }));

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found.' });
        }

        home.shoppingList.push(...newItems);
        await home.save();

        // Respond with only the newly created items for an efficient update on the client-side
        res.status(200).json({
            message: "Recipe transformed and items added to shopping list!",
            newItems: newItems 
        });
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
        const { taskText } = req.body;

        if (!taskText) {
            return res.status(400).json({ message: 'Task text is required.' });
        }

        // Mock response for a nested task structure with unique IDs
        const mockMainTask = {
            _id: new mongoose.Types.ObjectId(), 
            text: taskText,
            category: "משימה מורכבת",
            isUrgent: true,
            createdAt: new Date(),
            subItems: [ 
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `שלב א: תכנון (${taskText})`,
                    category: "תכנון",
                    completed: false,
                    createdAt: new Date(),
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `שלב ב: ביצוע (${taskText})`,
                    category: "ביצוע",
                    completed: false,
                    createdAt: new Date(),
                    subItems: [ 
                        { _id: new mongoose.Types.ObjectId(), text: 'שלב ב.1: איסוף חומרים', completed: false, createdAt: new Date() },
                        { _id: new mongoose.Types.ObjectId(), text: 'שלב ב.2: הרכבה', completed: false, createdAt: new Date() },
                    ]
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: `שלב ג: בדיקות (${taskText})`,
                    category: "בדיקות",
                    completed: false,
                    createdAt: new Date(),
                },
            ]
        };

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.tasksList.push(mockMainTask);
        await home.save();

        res.status(200).json({ 
            message: "Task broken down and sub-tasks added!",
            // Return the newly created task with its sub-tasks
            newItems: [mockMainTask] 
        });
    } catch (error) {
        handleError(res, error, 'Error breaking down task');
    }
};


module.exports = {
    transformRecipeToShoppingList,
    breakdownComplexTask,
};
