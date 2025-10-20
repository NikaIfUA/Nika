import { Router } from '../dependencies.ts';
import categoryRoutes from "./categoryRoutes.ts";
import imageRoutes from './imageRoutes.ts';
import itemRouter from "./itemRoutes.ts";
import mainRoutes from './mainRoutes.ts';
import materialRoutes from "./materialRoutes.ts";
import usersRoutes from './usersRoutes.ts';

const router = new Router();

itemRouter(router);
imageRoutes(router);
mainRoutes(router);
usersRoutes(router);
categoryRoutes(router);
materialRoutes(router);

export default router;