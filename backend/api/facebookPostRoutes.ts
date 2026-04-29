import { Router } from "../dependencies.ts";
import { API_PREFIX } from "../env.ts";
import FacebookPostService from "../services/facebookPostService.ts";
import { jwtMiddleware } from "../util/jwt.ts";

const facebookPostRoutes = (router: Router) => {
  // Public: anyone can view posts
  router.get(`/${API_PREFIX}facebook-posts`, FacebookPostService.getFacebookPosts);

  // Admin only: create, update, delete
  router.post(`/${API_PREFIX}facebook-posts`, jwtMiddleware(), FacebookPostService.saveFacebookPost);
  router.put(`/${API_PREFIX}facebook-posts/:id`, jwtMiddleware(), FacebookPostService.updateFacebookPost);
  router.delete(`/${API_PREFIX}facebook-posts/:id`, jwtMiddleware(), FacebookPostService.deleteFacebookPost);

  return router;
};

export default facebookPostRoutes;
