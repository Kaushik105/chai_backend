import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
	//TODO: create tweet
	const { content } = req.body;
	const user = req.user;

	if (!content) {
		throw new ApiError(400, "tweet cannot be blank");
	}

	const tweet = await Tweet.create({
		owner: new mongoose.Types.ObjectId(user._id),
		content: content,
	});

	if (!tweet) {
		throw new ApiError(500, "tweet creation failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
	// TODO: get user tweets
	const user = req.user;

	const tweets = await User.aggregate([
		{
			$match: { _id: user._id },
		},
		{
			$lookup: {
				from: "tweets",
				localField: "_id",
				foreignField: "owner",
				as: "tweets",
			},
		},
		{
			$project: {
				"tweets.owner": 1,
				"tweets.content": 1,
			},
		},
	]);

	if (!(tweets || tweets.length)) {
		throw new ApiError(500, "cannot get the tweets");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
	//TODO: update tweet
	const { newContent } = req.body;
	const { tweetId } = req?.params;

	if (!newContent) {
		throw new ApiError(400, "cannot get new content");
	}

	if (!tweetId) {
		throw new ApiError(400, "cannot get tweet id");
	}

	const updatedTweet = await Tweet.findByIdAndUpdate(
		tweetId,
		{
			$set: { content: newContent },
		},
		{
			new: true,
		}
	);

	if (!updatedTweet) {
		throw new ApiError(500, "tweet updation failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
	//TODO: delete tweet
	const {tweetId} = req?.params;

	if (!tweetId) {
		throw new ApiError(400, "cannot get tweet id");
	}

	const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

	if (!deletedTweet) {
		throw new ApiError(500, "tweet deletion failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
