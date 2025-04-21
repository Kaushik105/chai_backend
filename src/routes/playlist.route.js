import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
	createPlaylist,
	getPlaylistById,
	addVideoToPlaylist,
	removeVideoFromPlaylist,
	getUserPlaylists,
	updatePlaylist,
	deletePlaylist,
} from "../controllers/playlist.controller.js";
import { deleteVideo } from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post(createPlaylist);
router.route("user/:userId").get(getUserPlaylists);
router
	.route("/:playlistId")
	.get(getPlaylistById)
	.delete(deletePlaylist)
	.patch(updatePlaylist);
router
	.route("/:playlistId/:videoId")
	.patch(addVideoToPlaylist)
	.delete(removeVideoFromPlaylist);

export default router;
