import { Router } from "../dependencies.ts";
import { MainController } from "../controllers/mainController.ts";

const router = new Router();
const mainController = new MainController();

router.get("/api/info", (ctx) => mainController.handle(ctx));
router.get("/api/home", (ctx) => mainController.handle(ctx));

// Add root route with list of all routes
router.get("/", (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = {
        message: "Welcome to the API!",
        routes: [
            { method: "GET", path: "/api/info", description: "Fetch information" },
            { method: "GET", path: "/api/home", description: "Fetch home information" },
        ],
    };
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
});

export default router;
