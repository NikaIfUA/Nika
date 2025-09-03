import { Router } from "../dependencies.ts";
import { FetchInfoService } from "../services/fetchInfoService.ts";
import type { Context } from "oak";

const mainController = new Router();
const fetchInfoService = new FetchInfoService();

mainController.get("/api/info", (ctx: Context) => {
    fetchInfoService.handleRequest(ctx);
});

mainController.all("(.*)", (ctx) => {
    ctx.response.status = 404;
    ctx.response.body = "Not Found";
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
});

export default mainController;