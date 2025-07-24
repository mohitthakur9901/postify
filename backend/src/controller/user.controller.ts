// import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import User from "../models/user.model";
import Notification from "../models/notification.model";
import AsyncHandler from "../utils/Asynchandler";
import { clerkClient, getAuth } from "@clerk/express";
import { ObjectId } from 'mongodb';

export const getUserProfile = AsyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User Not Found"));
    }
    return res.status(200).json(new ApiResponse(200, user));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Getting User"));
  }
});

export const updateProfile = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOneAndUpdate({ clerkId: userId }, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User Not Found"));
    }
    return res.status(200).json(new ApiResponse(200, user));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Updating User"));
  }
});

export const syncUser = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const existingUser = await User.findOne({ clerkId: userId });
    if (existingUser) {
      return res
        .status(200)
        .json({ user: existingUser, message: "User already exists" });
    }

    // create new user from Clerk data
    const clerkUser = await clerkClient.users.getUser(userId?.toString() || "");

    const userData = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
      profilePicture: clerkUser.imageUrl || "",
    };

    const user = await User.create(userData);
    return res.status(200).json({ user, message: "User synced successfully" });
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Syncing User"));
  }
});

export const getCurrentUser = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User Not Found"));
    } else {
      return res.status(200).json(new ApiResponse(200, user));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Getting User"));
  }
});

export const followUser = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { targetUserId } = req.params;
    if (userId === targetUserId)
      return res
        .status(400)
        .json(new ApiError(400, "You cannot follow yourself"));

    const currentUser = await User.findOne({ clerkId: userId });
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser)
      return res.status(404).json(new ApiError(404, "User Not Found"));

    const isFollowing = currentUser.following.includes(new ObjectId(targetUserId));

    if (isFollowing) {
      // unfollow
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUser._id },
      });
    } else {
      // follow
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentUser._id },
      });

      // create notification
      await Notification.create({
        from: currentUser._id,
        to: targetUserId,
        type: "follow",
      });
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          isFollowing ? "Unfollowed User" : "Followed User"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error While Following User"));
  }
});
