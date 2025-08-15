import { RouterContext } from "../dependencies.ts";

export function fetchInfo(ctx: RouterContext<string>) {
    const { response } = ctx;

    response.status = 200;
    response.body = { message: "Hello from Deno!" };
    response.headers.set("Content-Type", "application/json");
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response.body;
}
