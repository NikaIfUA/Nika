import { Router } from "../dependencies.ts";
import MainService from "../services/mainService.ts";
import { API_PREFIX } from "../env.ts";
import CategoryService from "../services/categoryService.ts";
import MaterialService from "../services/materialService.ts";

const mainRouter = (router: Router) => {
  router.get(`/${API_PREFIX}get-info`, MainService.fetchInfo);
  router.get(`/${API_PREFIX}get-file-content/:fileName`, MainService.fetchFileContent);
  router.get(`/${API_PREFIX}get-categories`, CategoryService.getCategories);
  router.get(`/${API_PREFIX}get-materials`, MaterialService.getMaterials);
  return router;
};

export default mainRouter;
