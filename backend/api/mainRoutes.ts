import { Router } from "../dependencies.ts";
import MainService from "../services/mainService.ts";
import { API_PREFIX } from "../env.ts";

const mainRouter = (router: Router) => {
  router.get(`/${API_PREFIX}get-info`, MainService.fetchInfo);
  router.get(`/${API_PREFIX}get-info-tree`, MainService.fetchInfoTree);
  router.get(`/${API_PREFIX}get-info-tree/children`, MainService.fetchInfoTreeChildren);
  router.get(`/${API_PREFIX}get-file-content/:fileName`, MainService.fetchFileContent);
  return router;
};

export default mainRouter;
