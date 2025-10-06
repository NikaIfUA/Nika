import { Router } from '../dependencies.ts';
import imageRoutes from './imageRoutes.ts';
import itemRouter from "./itemRoutes.ts";
import mainRoutes from './mainRoutes.ts';

const router = new Router();

itemRouter(router);
imageRoutes(router);
mainRoutes(router);

export default router;