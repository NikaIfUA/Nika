import { Router } from "../dependencies.ts";
import MainService from "../services/mainService.ts";
import ImageService from "../services/imageService.ts";
import CategoryService from "../services/categoryService.ts";
import MaterialService from "../services/materialService.ts";
import { API_PREFIX } from "../env.ts";

const router = new Router();

router.get(`/${API_PREFIX}get-info`, MainService.fetchInfo);
router.get(`/${API_PREFIX}get-file-content/:fileName`, MainService.fetchFileContent);
router.get(`/${API_PREFIX}get-image-by-id/:id`, ImageService.fetchImageById);
router.get(`/${API_PREFIX}get-all-images`, ImageService.fetchAllImages);
router.get(`/${API_PREFIX}get-categories`, MainService.getCategories);
router.get(`/${API_PREFIX}get-materials`, MainService.getMaterials);

router.post(`/${API_PREFIX}save-category`, CategoryService.saveCategory);
router.post(`/${API_PREFIX}save-material`, MaterialService.saveMaterial);
router.post(`/${API_PREFIX}save-image`, ImageService.uploadHandler);

export default router;
