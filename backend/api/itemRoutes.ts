import { Router } from "../dependencies.ts";
import ItemService from "../services/itemService.ts";
import { API_PREFIX } from "../env.ts";

const itemRouter = (router: Router) => {
  router.get(`/${API_PREFIX}items`, ItemService.fetchItems);
  router.get(`/${API_PREFIX}items/:id`, ItemService.fetchItemById);
  router.get(`/${API_PREFIX}items/:id/image`, ItemService.fetchItemImage);

  router.post(`/${API_PREFIX}items`, ItemService.createItem);

  // TODO: Додати роути для оновлення (PUT /items/:id) та видалення (DELETE /items/:id)

  return router;
};

export default itemRouter;