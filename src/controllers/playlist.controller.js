import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { log } from "console";

const createPlaylist = asyncHandler(async (req, res) => {
	const { name, description } = req.body;
	const { videoId } = req?.params;
	const user = req.user;

	if (!(name || description || videoId)) {
		throw new ApiError(400, "name, video and description is required");
	}
	//TODO: create playlist

	const playlist = await Playlist.create({
		name,
		description,
		owner: user._id,
		videos: [new mongoose.Types.ObjectId(videoId)],
	});

	if (!playlist) {
		throw new ApiError(500, "playlist creation failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		throw new ApiError(400, "can't get userId");
	}
	//TODO: get user playlists

	const playlists = await Playlist.aggregate([
		{
			$match: { owner: new mongoose.Types.ObjectId(userId) },
		},
		{
			$lookup: {
				from: "videos",
				localField: "videos",
				foreignField: "_id",
				as: "result",
			},
		},
		{
			$project: {
				result: 1,
			},
		},
	]);

	if (!playlists) {
		throw new ApiError(500, "no playlists found");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, playlists, "users playlists fetched successfully")
		);
});

const getPlaylistById = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;
	if (!playlistId) {
		throw new ApiError(400, "can't get playlist id");
	}

	//TODO: get playlist by id

	const playlist = await Playlist.findById(playlistId);

	if (!playlist) {
		throw new ApiError(500, "playlist not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req.params;

	if (!(playlistId && videoId)) {
		throw new ApiError(400, "can't get video or playlist id");
	}

	const playlist = await Playlist.findByIdAndUpdate(
		playlistId,
		{
			$push: {
				videos: { _id: videoId },
			},
		},
		{
			new: true,
		}
	);

	if (!playlist) {
		throw new ApiError(500, "video addition failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, playlist, "video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req?.params;

	if (!(playlistId && videoId)) {
		throw new ApiError(400, "can't get video or playlist id");
	}

	const playlist = await Playlist.findByIdAndUpdate(
		playlistId,
		{
			$pull: {
				videos: new mongoose.Types.ObjectId(videoId),
			},
		},
		{
			new: true,
		}
	);

	if (!playlist) {
		throw new ApiError(500, "video removal failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(299, playlist, "video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;

	if (!playlistId) {
		throw new ApiError(400, "can't get playlist id");
	}
	// TODO: delete playlist

	const playlist = await Playlist.findByIdAndDelete(playlistId);

	if (!playlist) {
		throw new ApiError(500, "plalist deletion failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, playlist, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;
	const { name, description } = req.body;
	//TODO: update playlist
	if (!(name && description && playlistId)) {
		throw new ApiError(400, "invalid parameters to update playlist");
	}

	const playlist = await Playlist.findByIdAndUpdate(
		playlistId,
		{
			name,
			description,
		},
		{
			new: true,
		}
	);

	if (!playlist) {
		throw new ApiError(500, "playlist updation failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
	createPlaylist,
	getUserPlaylists,
	getPlaylistById,
	addVideoToPlaylist,
	removeVideoFromPlaylist,
	deletePlaylist,
	updatePlaylist,
};
