import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import AsyncHandler from "../utils/Asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getComments = AsyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  res.status(200).json(new ApiResponse(200, comments));
    
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Getting Comments"));

  }
});

export const createComment = AsyncHandler(async (req, res) => {
 try {
   const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) return res.status(404).json(new ApiError(404, "User or Post Not Found"));

  const comment = await Comment.create({
    user: user._id,
    post: postId,
    content,
  });

  // link the comment to the post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  // create notification if not commenting on own post
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comment._id,
    });
  }

  res.status(201).json(new ApiResponse(201, comment));
  
 } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Creating Comment"));
  
 }
});

export const deleteComment = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
  const { commentId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    return res.status(404).json(new ApiError(404, "User or Comment Not Found"));
  }

  if (comment.user.toString() !== user._id.toString()) {
    return res.status(403).json(new ApiError(403, "You are not authorized to delete this comment"));
  }

  // remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // delete the comment
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Deleting Comment"));
    
  }
});