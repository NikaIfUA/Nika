import { Router } from "../dependencies.ts";
import UserService from "../services/userService.ts";
import { jwtMiddleware } from "../util/jwt.ts";
import { API_PREFIX } from "../env.ts";

const usersRoutes = (router: Router) => {
  router.post(`/${API_PREFIX}auth/register`, UserService.register);
  router.post(`/${API_PREFIX}auth/login`, UserService.login);
  router.post(`/${API_PREFIX}auth/logout`, UserService.logout);

  router.get(`/${API_PREFIX}auth/check`, UserService.checkAuth);

  // Protected admin route example
  router.get(`/${API_PREFIX}admin`, jwtMiddleware());
  return router;
};

export default usersRoutes;
