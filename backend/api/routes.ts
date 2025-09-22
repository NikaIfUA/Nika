import { Router } from "../dependencies.ts";
import MainService from "../services/mainService.ts";
import ImageService from "../services/imageService.ts";
import { API_PREFIX } from "../env.ts";
import UserService from "../services/userService.ts";
import { jwtMiddleware } from "../util/jwt.ts";

const router = new Router();

router.get(`/${API_PREFIX}get-info`, MainService.fetchInfo);
router.get(`/${API_PREFIX}get-file-content/:fileName`, MainService.fetchFileContent);
router.get(`/${API_PREFIX}get-image-by-id/:id`, ImageService.fetchImageById);
router.get(`/${API_PREFIX}get-all-images`, ImageService.fetchAllImages);
router.get(`/${API_PREFIX}get-categories`, MainService.getCategories);
router.get(`/${API_PREFIX}get-materials`, MainService.getMaterials);

router.post(`/${API_PREFIX}save-image`, ImageService.uploadHandler);
router.post(`/${API_PREFIX}auth/register`, UserService.register);
router.post(`/${API_PREFIX}auth/login`, UserService.login);
router.post(`/${API_PREFIX}auth/logout`, UserService.logout);

// Protected admin route example
router.get(`/${API_PREFIX}admin`, jwtMiddleware(), (ctx) => {
	const user = ctx.state.user;
	ctx.response.status = 200;
	ctx.response.body = { message: 'Welcome to admin area', user };
});

export default router;
