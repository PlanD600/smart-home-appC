// client/src/services/gemini.js

export const Gemini = {
    async generateStructuredText(prompt) {
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
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textResponse) {
                try {
                    // --- לוגיקת הניקוי והפענוח המשודרגת ---
                    // 1. מצא את האינדקס של הסוגר המסולסל הפותח הראשון '{'
                    const firstBrace = textResponse.indexOf('{');
                    // 2. מצא את האינדקס של הסוגר המסולסל הסוגר האחרון '}'
                    const lastBrace = textResponse.lastIndexOf('}');

                    // 3. אם מצאנו את שניהם, נחלץ את הטקסט שביניהם
                    if (firstBrace !== -1 && lastBrace !== -1) {
                        const jsonString = textResponse.substring(firstBrace, lastBrace + 1);
                        // 4. נפענח את ה-JSON הנקי
                        return JSON.parse(jsonString);
                    }
                    
                    // אם לא מצאנו מבנה JSON תקין
                    throw new Error("Could not find a valid JSON object in the AI response.");

                } catch (e) {
                    console.error("Failed to parse AI text response as JSON even after cleaning. Original:", textResponse);
                    throw new Error("שירות ה-AI החזיר תשובה בפורמט לא צפוי.");
                }
            }

            console.warn("Gemini response did not contain a text part. Response:", result);
            throw new Error("שירות ה-AI לא הצליח לעבד את הבקשה. נסה שוב או שנה את הניסוח.");

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw error;
        }
    }
};