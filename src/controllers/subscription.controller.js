import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
	const { channelId } = req.params;
	const user = req.user;
	// TODO: toggle subscription
	if (!channelId) {
		throw new ApiError(400, "channel id not found");
	}

	let issubscribed = await Subscription.find({
		channel: channelId,
		subscriber: user._id
	})
	if (issubscribed.length) {
		issubscribed = await Subscription.findOneAndDelete({
			channel: channelId,
			subscriber: user._id,
		});
	} else {
		issubscribed = await Subscription.create({
			channel: channelId,
			subscriber: user._id,
		});
	}

	

	if (!issubscribed) {
		throw new ApiError(500, "subscription failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, issubscribed, "subscription status toggled"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
	const { channelId } = req.params;

	if (!channelId) {
		throw new ApiError(400, "can't get channel id")
	}

	const subscribers = await Subscription.aggregate([
		{
			$match: { channel: new mongoose.Types.ObjectId("68032110041b9479f42f2c01") },
		},
		{
			$lookup: {
				from: "users",
				localField: "subscriber",
				foreignField: "_id",
				as: "subscribers",
			},
		},
		{
			$project: {
				subscribers: 1,
				_id: 0,
			},
		},
	]);

	if (!subscribers) {
		throw new ApiError(500, "no subscribers found")
	}
	
	return res
	.status(200)
	.json(new ApiResponse(200, subscribers, "done"))
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
	const { subscriberId } = req.params;

	if (!subscriberId) {
		throw new ApiError(400, "can't get subscribed id");
	}

	const channels = await Subscription.aggregate([
		{
			$match: {
				subscriber: new mongoose.Types.ObjectId(subscriberId),
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "channel",
				foreignField: "_id",
				as: "channels",
			},
		},
		{
			$project: {
				channels: 1,
				_id: 0,
			},
		},
	]);

	if (!channels) {
		throw new ApiError(500, "no subscribers found");
	}

	return res.status(200).json(new ApiResponse(200, channels, "done"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
