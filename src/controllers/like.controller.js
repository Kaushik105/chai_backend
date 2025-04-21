import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const user = req.user;
	//TODO: toggle like on video

	if (!videoId) {
		throw new ApiError(400, "can't get the video Id");
	}

	let like = await Like.findOne({ likedBy: user._id, video: videoId });
	if (like) {
		like = await Like.findByIdAndDelete(like._id);
	} else {
		like = await Like.create({
			likedBy: user._id,
			video: videoId,
		});
	}

	if (!like) {
		throw new ApiError(500, "video like toggle failed");
	}

	return res.status(200).json(new ApiResponse(200, like, "video like toggled"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	const user = req.user;
	//TODO: toggle like on comment

	if (!commentId) {
		throw new ApiError(400, "can't get the comment Id");
	}

	let like = await Like.findOne({ likedBy: user._id, comment: commentId });
	if (like) {
		like = await Like.findByIdAndDelete(like._id);
	} else {
		like = await Like.create({
			likedBy: user._id,
			comment: commentId,
		});
	}

	if (!like) {
		throw new ApiError(500, "comment like toggle failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, like, "comment like toggled"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;
	const user = req.user;
	//TODO: toggle like on tweet
	if (!tweetId) {
		throw new ApiError(400, "can't get the tweet Id");
	}

	let like = await Like.findOne({ likedBy: user._id, tweet: tweetId });
	if (like) {
		like = await Like.findByIdAndDelete(like._id);
	} else {
		like = await Like.create({
			likedBy: user._id,
			tweet: tweetId,
		});
	}

	if (!like) {
		throw new ApiError(500, "tweet like toggle failed");
	}

	return res.status(200).json(new ApiResponse(200, like, "tweet like toggled"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
	const user = req.user;
	//TODO: get all liked videos
	const likedVideos = await Like.aggregate([
		[
			{
				$match: {
					likedBy: new mongoose.Types.ObjectId("6803216f041b9479f42f2c19"),
					video: { $exists: true, $ne: null },
				},
			},
			{
				$lookup: {
					from: "videos",
					localField: "video",
					foreignField: "_id",
					as: "result",
				},
			},
			{
				$unwind: {
					path: "$result",
					preserveNullAndEmptyArrays: false,
				},
			},
		],
	]);

	if (!likedVideos) {
		throw new ApiError(500, "can't fetch liked videos");
	}
     
	return res
		.status(200)
		.json(
			new ApiResponse(200, likedVideos, "liked videos fetched successfully")
		);
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
