import { Router } from "../dependencies.ts";
import { API_PREFIX } from "../env.ts";
import CategoryService from "../services/categoryService.ts";


const categoryRoutes = (router: Router) => {
  router.get(`/${API_PREFIX}get-categories`, CategoryService.getCategories);
  router.post(`/${API_PREFIX}save-category`, CategoryService.saveCategory);
  return router;
}

export default categoryRoutes;
