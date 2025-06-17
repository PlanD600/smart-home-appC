// client/src/services/gemini.js

export const Gemini = {
    async generateStructuredText(prompt, responseSchema) {
        // קריאת מפתח ה-API ממשתני הסביבה של Vite
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
        
        if (!apiKey || apiKey === "PASTE_YOUR_REAL_GOOGLE_AI_API_KEY_HERE") {
            const errorMsg = "מפתח ה-API של Gemini אינו מוגדר. אנא הגדר אותו בקובץ .env בתיקיית client.";
            console.error(errorMsg);
            alert(errorMsg);
            return null;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // ... שאר הקוד של הפונקציה נשאר זהה ...
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
            tools: [{
                functionDeclarations: [{
                    name: "extract_data",
                    description: "Extracts structured data from text.",
                    parameters: responseSchema
                }]
            }],
            toolConfig: {
                functionCallingConfig: {
                    mode: "ANY",
                    allowedFunctionNames: ["extract_data"]
                }
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

            const result = await response.json();
            const functionCall = result.candidates?.[0]?.content?.parts?.[0]?.functionCall;
            if (functionCall?.name === 'extract_data' && functionCall.args) {
                return functionCall.args;
            }
            return null;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return null;
        }
    }
};