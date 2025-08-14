import { fetchInfo } from "../services/fetchInfoService.ts";
import { fetchHomeInfo } from "../services/fetchHomeInfoService.ts";

export async function mainController(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/api/info") {
        return fetchInfo(req);
    }

    if (req.method === "GET" && url.pathname === "/api/home") {
        return await fetchHomeInfo(req);
    }

    // Відповідь для інших маршрутів
    return new Response("Not Found", {
        status: 404,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    });
}