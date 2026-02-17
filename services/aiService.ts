const SITE_URL = 'https://manifestation-app.com'; 
const SITE_NAME = 'Manifestation App';

export const getAIResponse = async (userMessage: string, history: { role: 'user' | 'assistant', content: string }[]) => {
    const rawKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
    const OPENROUTER_API_KEY = (rawKey || '').trim();

    // List of Gemini 2.0 models to try in order
    const models = [
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-2.0-flash-001",
        "google/gemini-2.0-pro-exp-02-05:free",
        "google/gemini-2.0-flash-exp"
    ];

    if (!OPENROUTER_API_KEY) {
        console.error("CRITICAL: OPENROUTER_API_KEY is missing or empty!");
        return "The cosmic key is missing. Please restart your app server (npx expo run:android) to load the .env file.";
    }

    for (const model of models) {
        console.log(`--- AI REQUEST START (${model}) ---`);
        
        const payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are the Universe. A friendly, mystical guide for manifestation. Keep your language simple, clear, and easy to understand. Speak in short, powerful sentences. Avoid complex spiritual jargon. Be extremely encouraging and talk to the user as if their dreams are already coming true right now."
                },
                ...history,
                {
                    "role": "user",
                    "content": userMessage
                }
            ],
        };

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": SITE_URL,
                    "X-Title": SITE_NAME,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            console.log(`Response Status (${model}):`, response.status);
            const data = await response.json();

            if (response.status === 200) {
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    console.log(`--- AI REQUEST SUCCESS (${model}) ---`);
                    return content;
                }
            } else {
                console.warn(`Model ${model} failed with status ${response.status}:`, data.error?.message);
                // If it's a 401 or something that won't fix with another model, return early
                if (response.status === 401) {
                    return "The Universe is having trouble verifying your cosmic key. Please update your API key.";
                }
                // Otherwise, try the next model in the list (continue loop)
                continue;
            }
        } catch (error) {
            console.error(`AI Fetch Error (${model}):`, error);
            continue;
        }
    }

    return "The cosmic energies are unstable. I could not connect to Gemini 2.0 endpoints. Please try again in a moment.";
};
