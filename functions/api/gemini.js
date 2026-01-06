export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        const apiKey = env.GEMINI_API_KEY;
        // Base URL for Gemini. Note: The exact endpoint might differ based on model version, 
        // but usually it's passed or constructed. 
        // The client code was: GEMINI_API_URL + apiKey
        // GEMINI_API_URL was likely "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key="

        // We will hardcode the base URL part here or allow passing it if needed, 
        // but better to keep it secure server-side if possible.
        // Let's assume standard Gemini URL structure.

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Server Configuration Error: Missing API Key" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Since the client code was appending 'key=', we interpret that here.
        const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
        const url = `${baseUrl}?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
