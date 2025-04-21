import { Router } from "express";
import {
	publishAVideo,
	getAllVideos,
	getVideoById,
	updateVideo,
	deleteVideo,
	togglePublishStatus,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // verifying all the request in this route

router
	.route("/")
	.get(getAllVideos)
	.post(
		upload.fields([
			{
				name: "newVideo",
				maxCount: 1,
			},
			{
				name: "newThumb",
				maxCount: 1,
			},
		]),
		publishAVideo
	);
router
	.route("/:videoId")
	.get(getVideoById)
	.delete(deleteVideo)
	.patch(upload.single("newThumb"), updateVideo);
router.route("/toggle-publish/:videoId").patch(togglePublishStatus);

export default router;
