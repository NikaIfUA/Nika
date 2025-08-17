import { Router } from "../dependencies.ts";
import MainService from "../services/mainService.ts";
import { API_PREFIX } from "../env.ts";

const router = new Router();

router.get(`/${API_PREFIX}get-info`, MainService.fetchInfo);
router.get(`/${API_PREFIX}get-file-content/:fileName`, MainService.fetchFileContent);

export default router;
