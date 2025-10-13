import { Router } from '../dependencies.ts';
import imageRoutes from './imageRoutes.ts';
import itemRouter from "./itemRoutes.ts";
import mainRoutes from './mainRoutes.ts';
import usersRoutes from './usersRoutes.ts';

const router = new Router();

itemRouter(router);
imageRoutes(router);
mainRoutes(router);
usersRoutes(router);

export default router;