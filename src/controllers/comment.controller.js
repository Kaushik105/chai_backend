import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
	//TODO: get all comments for a video
	const { videoId } = req.params;
	const { page = 1, limit = 10 } = req.query;

	if (!videoId) {
		throw new ApiError(400, "can't get video Id");
	}

	const comments = await Comment.aggregate([
		{
			$match: { video: new mongoose.Types.ObjectId(videoId) },
		},
		{
			$project: { content: 1, _id:0 },
		},
	]);

	if (!comments) {
		throw new ApiError(500, "can't get the comments");
	}
	console.log(comments);

	return res
		.status(200)
		.json(new ApiResponse(200, comments, "comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { content } = req.body;
	const user = req.user;
	if (!videoId) {
		throw new ApiError(400, "can't get video Id");
	}
	// TODO: add a comment to a video
	const comment = await Comment.create({
		video: videoId,
		content,
		owner: user._id,
	});

	if (!comment) {
		throw new ApiError(500, "comment addition failed");
	}

	return res.status(200).json(new ApiResponse(200, comment, "comment added"));
});

const updateComment = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	const { newContent } = req.body;
	const user = req.user;
	// TODO: update a comment
	if (!commentId) {
		throw new ApiError(400, "can't get comment id");
	}

	const comment = await Comment.findByIdAndUpdate(commentId, {
		content: newContent,
	},{new: true});

	if (!comment) {
		throw new ApiError(500, "comment updation failed");
	}

	return res.status(200).json(new ApiResponse(200, comment, "comment updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
	const { commentId } = req.params;

	if (!commentId) {
		throw new ApiError(400, "can't get comment id");
	}
	// TODO: delete a comment

	const comment = await Comment.findByIdAndDelete(commentId);

	if (!comment) {
		throw new ApiError(500, "comment deletion failed");
	}

	return res.status(200).json(new ApiResponse(200, comment, "comment deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
