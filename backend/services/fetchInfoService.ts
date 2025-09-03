import type { RouterContext } from "../dependencies.ts";

export class FetchInfoService {
    handleRequest(ctx: RouterContext<string, Record<string, string>>): void {
        const { request, response } = ctx;

        console.log("Request method:", request.method);
        console.log("Request URL:", request.url.pathname);

        if (request.method === "OPTIONS") {
            console.log("Handling OPTIONS request");
            response.status = 204;
            response.headers.set("Access-Control-Allow-Origin", "*");
            response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type");
            return;
        }

        // Основний маршрут
        if (request.method === "GET" && request.url.pathname === "/api/info") {
            console.log("Handling GET request for /api/info");
            response.status = 200;
            response.body = { message: "Hello from Oak!" };
            response.headers.set("Content-Type", "application/json");
            response.headers.set("Access-Control-Allow-Origin", "*");
            return;
        }

        // Відповідь для інших маршрутів
        console.log("Route not found");
        response.status = 404;
        response.body = "Not Found";
        response.headers.set("Access-Control-Allow-Origin", "*");
    }
}
