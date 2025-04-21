import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "username is required"],
			unique: true,
			trim: true,
			index: true,
			lowercase: true,
		},
		email: {
			type: String,
			required: [true, "username is required"],
			unique: true,
		},
		fullName: {
			type: String,
			required: [true, "username is required"],
		},
		avatar: {
			type: String,
			default: "",
		},
		coverImage: {
			type: String,
			default: "",
		},
		refreshToken: {
			type: String,
			default: ""
		},
		password: {
			type: String,
			required: true,
			min: [5, "min password length is 5"],
		},
		watchHistory: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Video",
		}],
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullName: this.fullName,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		}
	);
};
userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		}
	);
};

export const User = mongoose.model("User", userSchema);
