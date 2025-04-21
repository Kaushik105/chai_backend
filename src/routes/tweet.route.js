import { Router } from "express";
import {deleteTweet, updateTweet, getUserTweets, createTweet} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/")
.get(getUserTweets)
.post(createTweet)

router.route("/:tweetId")
.delete(deleteTweet)
.patch(updateTweet)

export default router