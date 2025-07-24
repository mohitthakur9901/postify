import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model";
import User from "../models/user.model";

import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import AsyncHandler from "../utils/Asynchandler";

export const getNotifications = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const notifications = await Notification.find({ to: user._id })
      .sort({ createdAt: -1 })
      .populate("from", "username firstName lastName profilePicture")
      .populate("post", "content image")
      .populate("comment", "content");

    res.status(200).json(new ApiResponse(200, notifications));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error While Getting Notifications"));
  }
});

export const deleteNotification = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { notificationId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json(new ApiError(404, "User not found"));

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      to: user._id,
    });

    if (!notification)
      return res.status(404).json(new ApiError(404, "Notification not found"));

    res
      .status(200)
      .json(new ApiResponse(200, "Notification deleted successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error While Deleting Notification"));
  }
});
