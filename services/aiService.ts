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
        return "The API key is missing. Please restart your app server (npx expo run:android) to load it.";
    }

    for (const model of models) {
        console.log(`--- AI REQUEST START (${model}) ---`);
        
        const payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a friendly and practical guide. Keep your language simple, clear, and direct. Speak in short, helpful sentences. Avoid complex jargon. Be extremely encouraging and help the user realize their goals."
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
                const raw = data.choices?.[0]?.message?.content;
                // Guard: Hermes crashes (SIGSEGV in stringPrototypeReplace) if a
                // non-string value reaches String.prototype.replace internally.
                const content = typeof raw === 'string' ? raw : null;
                if (content) {
                    console.log(`--- AI REQUEST SUCCESS (${model}) ---`);
                    return content;
                }
            } else {
                console.warn(`Model ${model} failed with status ${response.status}:`, data.error?.message);
                if (response.status === 401) {
                    return "Your API key appears to be invalid or expired. Please check your OpenRouter account.";
                }
                continue;
            }
        } catch (error) {
            console.error(`AI Fetch Error (${model}):`, error);
            continue;
        }
    }

    return "There was an issue connecting to the AI service. Please try again in a moment.";
};
