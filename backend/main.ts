import { Application, oakCors } from "./dependencies.ts";
import router from "./api/routes.ts";

const app = new Application();

// Add request logging middleware
app.use(async (ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    console.log(`${ctx.request.method} ${ctx.request.url}`);
  }
  await next();
});

// Let's use oakCors instead of manually setting the headers
app.use(oakCors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Oak server running on http://localhost:8000`);
await app.listen({ port: 8000 });
