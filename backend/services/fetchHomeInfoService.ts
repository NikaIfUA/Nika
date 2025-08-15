import { RouterContext } from "../dependencies.ts";

export async function fetchHomeInfo(ctx: RouterContext<string>) {
    const { request, response } = ctx;

    if (request.method === "GET" && ctx.request.url.pathname === "/api/home") {
        const filePath = new URL("../storage/text.txt", import.meta.url).pathname;
        try {
            const fileContent = await Deno.readTextFile(filePath);
            response.status = 200;
            response.body = { text: fileContent };
            response.headers.set("Content-Type", "application/json");
            response.headers.set("Access-Control-Allow-Origin", "*");
        } catch (_error) {
            response.status = 404;
            response.body = "File not found";
            response.headers.set("Access-Control-Allow-Origin", "*");
        }
        return response.body;
    }

    response.status = 404;
    response.body = "Not Found";
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response.body;
}
