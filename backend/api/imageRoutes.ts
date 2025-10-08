import { Router } from "../dependencies.ts";
import ImageService from "../services/imageService.ts";
import { API_PREFIX } from "../env.ts";

const imagesRoutes = (router: Router) => {
  router.get(`/${API_PREFIX}get-all-images`, ImageService.fetchAllImages);
  
  router.post(`/${API_PREFIX}save-image`, ImageService.uploadHandler);
  return router;
};

export default imagesRoutes;
