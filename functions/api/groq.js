export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        // Retrieve API key from environment variables
        const apiKey = env.GROQ_API_KEY;
        const modelName = env.GROQ_MODEL || "llama-3.3-70b-versatile";

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Server Configuration Error: Missing API Key" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...body,
                model: body.model || modelName
            })
        });

        // Proxy the response back to the client
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
                // Add CORS headers if you need them during dev, though 'wrangler pages dev' often handles it or they are same origin in production
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
