const https = require('https');
const Home = require('../models/Home');
const { handleError, mongoose, normalizeHomeObject } = require('../utils/controllerUtils');

/**
 * [Final V3] Helper function to call the Gemini API from the server
 * and parse the JSON response robustly.
 * @param {string} prompt The prompt to send to the Gemini API.
 * @returns {Promise<object>} The structured data from the AI response.
 */
async function callGeminiApi(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        throw new Error("Gemini API key is not configured on the server.");
    }

    const requestBody = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const result = JSON.parse(data);
                        const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
                        
                        if (textResponse) {
                            const firstBrace = textResponse.indexOf('{');
                            const lastBrace = textResponse.lastIndexOf('}');
                            
                            if (firstBrace !== -1 && lastBrace !== -1) {
                                const jsonString = textResponse.substring(firstBrace, lastBrace + 1);
                                resolve(JSON.parse(jsonString));
                                return;
                            }
                        }
                        console.error("Could not find or parse valid JSON from Gemini response:", textResponse);
                        reject(new Error("שירות ה-AI החזיר תשובה בפורמט לא צפוי."));

                    } catch (e) {
                        reject(new Error(`Error parsing Gemini response: ${e.message}`));
                    }
                } else {
                    reject(new Error(`Gemini API request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(requestBody);
        req.end();
    });
}

/**
 * [Final V3] Recursively adds Mongoose ObjectIDs to a nested item structure.
 * @param {object} item - An item object from the AI, which may contain subItems.
 * @param {string} currentUser - The name of the user creating the item.
 * @returns {object} The item object with all necessary database IDs.
 */
const addIdsToItemTree = (item, currentUser) => {
    const itemWithId = {
        ...item,
        _id: new mongoose.Types.ObjectId(),
        createdBy: currentUser || 'מערכת AI',
        completed: false,
        comment: item.comment || '', // Ensure comment field exists
    };
    if (item.subItems && Array.isArray(item.subItems)) {
        itemWithId.subItems = item.subItems.map(sub => addIdsToItemTree(sub, currentUser));
    }
    return itemWithId;
};


/**
 * [Final V3] Transforms a recipe name into a hierarchical shopping list item.
 */
const transformRecipeToShoppingList = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { recipeText, currentUser } = req.body;

        if (!recipeText) {
            return res.status(400).json({ message: 'Recipe text is required.' });
        }

        const prompt = `
            You are an expert recipe assistant. Your task is to generate a hierarchical JSON object for a shopping list.
            The main object should have a "text" key with the recipe name (e.g., "Ingredients for Shakshuka"), and a "subItems" array.
            Each object in the "subItems" array represents an ingredient and should only have a "text" key.

            Example for "שקשוקה":
            {
                "text": "מצרכים לשקשוקה",
                "subItems": [
                    { "text": "4 ביצים" },
                    { "text": "1 בצל גדול, קצוץ" },
                    { "text": "2 שיני שום, קצוצות" },
                    { "text": "1 פלפל אדום, חתוך לקוביות" },
                    { "text": "1 קופסה (400 גרם) עגבניות מרוסקות" },
                    { "text": "1 כף רסק עגבניות" },
                    { "text": "1 כפית פפריקה מתוקה" },
                    { "text": "מלח ופלפל לפי הטעם" },
                    { "text": "שמן זית לטיגון" }
                ]
            }

            Now, process the following user request: "${recipeText}"

            Your response must be ONLY a valid JSON object matching this structure.
        `;

        const structuredData = await callGeminiApi(prompt);

        if (!structuredData || !structuredData.text || !structuredData.subItems) {
            return res.status(500).json({ message: "שירות ה-AI לא הצליח לייצר רשימת מצרכים היררכית." });
        }
        
        const recipeItemWithIds = addIdsToItemTree(structuredData, currentUser);

        recipeItemWithIds.category = 'מתכון AI';
        recipeItemWithIds.isUrgent = false;

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.shoppingList.push(recipeItemWithIds);
        await home.save();

        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error transforming recipe');
    }
};


/**
 * [Final V3] Breaks down a complex task into a nested structure with comments.
 */
const breakdownComplexTask = async (req, res) => {
    try {
        const { homeId } = req.params;
        const { taskText, currentUser } = req.body;

        if (!taskText) {
            return res.status(400).json({ message: 'Task text is required.' });
        }

        const prompt = `
            You are an expert project manager. Your task is to break down a complex user request into a hierarchical JSON structure.
            Each object in the structure must have a "text" key (the task title) and can optionally have a "comment" key (for explanations or tips) and a "subItems" array for nested tasks.
            The language for all text and comments must be Hebrew.

            Example for "הכנת פיצה ביתית":
            {
                "text": "הכנת פיצה ביתית",
                "comment": "תהליך הכנת פיצה מאפס, כולל בצק, רוטב, תוספות ואפייה.",
                "subItems": [
                    {
                        "text": "שלב 1: הכנת בצק שמרים",
                        "comment": "יש להתחיל לפחות שעתיים לפני הזמן הרצוי. חשוב לתת לבצק לתפוח במקום חמים.",
                        "subItems": [
                            { "text": "ערבוב קמח, שמרים, סוכר ומלח" },
                            { "text": "הוספת מים ושמן וללוש כ-10 דקות" },
                            { "text": "התפחה ראשונה (כ-60 דקות)" },
                            { "text": "התפחה שנייה (כ-30 דקות)" }
                        ]
                    },
                    {
                        "text": "שלב 2: הכנת רוטב עגבניות",
                        "comment": "אפשר להשתמש בעגבניות טריות או מקופסה. מומלץ לתבל היטב.",
                        "subItems": [
                            { "text": "טיגון קל של שום בשמן זית" },
                            { "text": "הוספת עגבניות מרוסקות ותבלינים" },
                            { "text": "בישול על אש קטנה כ-15 דקות" }
                        ]
                    },
                    { 
                        "text": "שלב 3: הרכבת הפיצה ואפייה",
                        "comment": "יש לחמם תנור מראש לחום הכי גבוה שאפשר. זמן האפייה קצר יחסית."
                    }
                ]
            }

            Now, process the following user request: "${taskText}"

            Your response must be ONLY a valid JSON object matching the detailed structure shown in the example.
        `;
        
        const structuredData = await callGeminiApi(prompt);
        
        if (!structuredData || !structuredData.text) {
            return res.status(500).json({ message: "שירות ה-AI לא הצליח לפרק את המשימה." });
        }
        
        const mainTaskWithIds = addIdsToItemTree(structuredData, currentUser);

        mainTaskWithIds.category = "משימה מורכבת";
        mainTaskWithIds.isUrgent = true;

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).json({ message: 'Home not found.' });

        home.tasksList.push(mainTaskWithIds);
        await home.save();

        res.status(200).json(normalizeHomeObject(home));
    } catch (error) {
        handleError(res, error, 'Error breaking down task');
    }
};


module.exports = {
    transformRecipeToShoppingList,
    breakdownComplexTask,
};
