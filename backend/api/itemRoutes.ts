import { Router } from "../dependencies.ts";
import ItemService from "../services/itemService.ts";
import { API_PREFIX } from "../env.ts";

const itemRouter = (router: Router) => {
  router.get(`/${API_PREFIX}items`, ItemService.fetchItems);
  router.get(`/${API_PREFIX}items/:id/image`, ItemService.fetchItemImage);
  return router;
};

export default itemRouter;
