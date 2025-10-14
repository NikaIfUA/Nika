import { Router } from "../dependencies.ts";
import { API_PREFIX } from "../env.ts";
import MaterialService from "../services/materialService.ts";


const materialRoutes = (router: Router) => {
  router.get(`/${API_PREFIX}get-materials`, MaterialService.getMaterials);
  router.post(`/${API_PREFIX}save-material`, MaterialService.saveMaterial);
  return router;
}

export default materialRoutes;
