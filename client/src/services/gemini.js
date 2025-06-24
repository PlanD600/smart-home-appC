// client/src/services/gemini.js

export const Gemini = {
    async generateStructuredText(prompt, responseSchema) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
        
        if (!apiKey || apiKey === "PASTE_YOUR_REAL_GOOGLE_AI_API_KEY_HERE") {
            const errorMsg = "מפתח ה-API של Gemini אינו מוגדר. אנא הגדר אותו בקובץ .env בתיקיית client.";
            console.error(errorMsg);
            alert(errorMsg);
            return null;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
            // --- החלק החשוב ---
            toolConfig: {
                functionCallingConfig: {
                    mode: "AUTO"
                    // ודא שהשורה allowedFunctionNames נמחקה מכאן
                }
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorBody = `API request failed with status ${response.status}`;
                try {
                    const googleError = await response.json();
                    console.error("Detailed error from Google:", googleError);
                    errorBody = googleError.error?.message || errorBody;
                } catch (e) {
                    console.error("Could not parse error response from Google.");
                }
                throw new Error(errorBody);
            }

            const result = await response.json();
            const functionCall = result.candidates?.[0]?.content?.parts?.[0]?.functionCall;

            if (functionCall?.name === 'extract_data' && functionCall.args) {
                return functionCall.args;
            }

            console.warn("Gemini response did not contain a function call. Response:", result);
            // אם Gemini לא החזיר תשובה במבנה הנכון, נחזיר הודעת שגיאה למשתמש
            throw new Error("שירות ה-AI לא הצליח לעבד את הבקשה. נסה שוב או שנה את הניסוח.");

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw error;
        }
    }
};