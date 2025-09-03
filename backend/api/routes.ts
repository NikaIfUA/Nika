import { Router } from "../dependencies.ts";
import MainService from "../services/mainService.ts";
import ImageService from "../services/imageService.ts";
import CategoryService from "../services/categoryService.ts";
import { API_PREFIX } from "../env.ts";

const router = new Router();

router.get(`/${API_PREFIX}get-info`, MainService.fetchInfo);
router.get(`/${API_PREFIX}get-file-content/:fileName`, MainService.fetchFileContent);
router.get(`/${API_PREFIX}get-all-images`, ImageService.fetchAllImages);
router.get(`/${API_PREFIX}get-categories`, MainService.getCategories);
router.get(`/${API_PREFIX}get-materials`, MainService.getMaterials);
router.get(`/${API_PREFIX}get-images`, ImageService.fetchAllImages);
router.get(`/${API_PREFIX}get-images/:imageId`, ImageService.getImageById);

router.post(`/${API_PREFIX}save-image`, ImageService.uploadHandler);
router.post(`/${API_PREFIX}create-category`, CategoryService.saveCategory);

export default router;
