// services/aiService.ts - FINAL DIAGNOSTIC VERSION

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getAiTravelResponse = async (userInput: string): Promise<string> => {
    
    if (!API_KEY) {
        return "FATAL ERROR: The Groq API Key is not being loaded from the .env.local file. Please check the file and restart your server.";
    }

    const payload = {
        model: "moonshotai/kimi-k2-instruct-0905", 
        messages: [ { role: "user", content: userInput } ],
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        // THIS IS THE FINAL FIX: We now check the response AFTER parsing it.
        if (!response.ok) {
            // We will now construct a detailed error message to display directly to the user.
            const errorMessage = `AI SERVER ERROR (${response.status}):\n\n${data?.error?.message || 'No specific error message provided.'}`;
            console.error("--- GROQ SERVER ERROR ---");
            console.error(data); // Log the full error object
            return errorMessage;
        }

        const aiText = data?.choices?.[0]?.message?.content;

        if (!aiText) {
            console.error("Unexpected response format from Groq:", data);
            return "AI response was successful, but the format was unexpected. Please check the console.";
        }

        return aiText;

    } catch (error) {
        console.error("A critical network or parsing error occurred:", error);
        return "A critical network error occurred. Are you connected to the internet? Please check the console.";
    }
};