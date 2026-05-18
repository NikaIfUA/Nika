import { Router } from "../dependencies.ts";
import TechnologyService from "../services/technologyService.ts";
import ImageService from "../services/imageService.ts";
import { API_PREFIX } from "../env.ts";

const technologyRoutes = (router: Router) => {
  router.get(`/${API_PREFIX}get-technologies`, TechnologyService.getTechnologies);
  router.get(`/${API_PREFIX}technologies/:slug`, TechnologyService.getTechnologyBySlug);
  router.get(`/${API_PREFIX}technologies/:technologyId/images/:imageId`, ImageService.fetchImageByIdGeneric);
  router.post(`/${API_PREFIX}save-technology`, TechnologyService.saveTechnology);
  router.put(`/${API_PREFIX}technologies/:id`, TechnologyService.updateTechnology);
  router.delete(`/${API_PREFIX}technologies/:id`, TechnologyService.deleteTechnology);
  return router;
};

export default technologyRoutes;
