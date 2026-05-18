import { Router } from "../dependencies.ts";
import { API_PREFIX } from "../env.ts";
import CategoryService from "../services/categoryService.ts";
import ImageService from "../services/imageService.ts";


const categoryRoutes = (router: Router) => {
  router.get(`/${API_PREFIX}get-categories`, CategoryService.getCategories);
  router.get(`/${API_PREFIX}categories/:categoryId/images/:imageId`, ImageService.fetchImageByIdGeneric);
  router.post(`/${API_PREFIX}save-category`, CategoryService.saveCategory);

  router.put(`/${API_PREFIX}categories/:id`, CategoryService.updateCategory);
  
  router.delete(`/${API_PREFIX}categories/:id`, CategoryService.deleteCategory);
  return router;
}

export default categoryRoutes;
