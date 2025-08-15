import { RouterContext } from "../dependencies.ts";
import { fetchInfo } from "../services/fetchInfoService.ts";
import { fetchHomeInfo } from "../services/fetchHomeInfoService.ts";

export class MainController {
    async handle(ctx: RouterContext<any, any, any>) {
        const { request, response } = ctx;

        response.headers.set("Access-Control-Allow-Origin", "*");

        if (request.method === "GET" && ctx.request.url.pathname === "/api/info") {
            response.body = await fetchInfo(ctx);
            return;
        }

        if (request.method === "GET" && ctx.request.url.pathname === "/api/home") {
            response.body = await fetchHomeInfo(ctx);
            return;
        }

        // Response for other routes
        response.status = 404;
        response.body = "Not Found";
    }
}