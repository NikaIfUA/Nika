import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { mainController } from "./controllers/mainController.ts";

serve((req) => {
    return mainController(req);
});

console.log("Deno server running on http://localhost:8000");