import { Router } from "../dependencies.ts";
import ItemService from "../services/itemService.ts";
import { API_PREFIX } from "../env.ts";

const itemRouter = (router: Router) => {
  router.get(`/${API_PREFIX}items`, ItemService.fetchItems);
  router.get(`/${API_PREFIX}items/:id`, ItemService.fetchItemById);
  router.get(`/${API_PREFIX}items/:id/image`, ItemService.fetchItemImage);
  router.get(`/${API_PREFIX}items/:itemId/images/:imageId`, ItemService.fetchItemImagesById);

  router.post(`/${API_PREFIX}items`, ItemService.createItem);

  router.put(`/${API_PREFIX}items/:id`, ItemService.updateItem);

  router.delete(`/${API_PREFIX}items/:id`, ItemService.deleteItem);

  return router;
};

export default itemRouter;