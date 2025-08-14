import { fetchInfo } from "../services/fetchInfoService.ts";

export function mainController(req: Request): Response {
    if (req.method === "GET" && req.url === "/api/info") {
        return fetchInfo(req);
    }

    // Відповідь для інших маршрутів
    return new Response("Not Found", {
        status: 404,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    });
}