export async function fetchHomeInfo(req: Request): Promise<Response>     {
    const url = new URL(req.url);

    // Обробка Preflight (OPTIONS) запитів
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    // Основний маршрут
    if (req.method === "GET" && url.pathname === "/api/home") {

        const fileContent = await Deno.readTextFile("./storage/text.txt");

        return new Response(JSON.stringify({ text: fileContent }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }

    // Відповідь для інших маршрутів
    return new Response("Not Found", {
        status: 404,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    });
}
