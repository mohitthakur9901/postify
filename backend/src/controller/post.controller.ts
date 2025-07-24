import Post from "../models/post.model";
import User from "../models/user.model";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model";
import Comment from "../models/comment.model";
import AsyncHandler from "../utils/Asynchandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { v2 as cloudinary } from "cloudinary";

export const getPosts = AsyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username firstName lastName profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePicture",
        },
      });
    return res.status(200).json(new ApiResponse(200, posts));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Getting Posts"));
  }
});

export const getPost = AsyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("user", "username firstName lastName profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePicture",
        },
      });

    if (!post)
      return res.status(404).json(new ApiResponse(404, "Post Not Found"));

    return res.status(200).json(new ApiResponse(200, post));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Getting Post"));
  }
});

export const getUserPosts = AsyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json(new ApiResponse(404, "User Not Found"));

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "username firstName lastName profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePicture",
        },
      });

    res.status(200).json(new ApiResponse(200, posts));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error While Getting User Posts"));
  }
});

export const createPost = AsyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const imageFile = req.file;

  if (!content && !imageFile) {
    return res
      .status(400)
      .json(new ApiError(400, "Content or image is required"));
  }

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json(new ApiError(404, "User Not Found"));

  let imageUrl = "";

  // upload image to Cloudinary if provided
  if (imageFile) {
    try {
      // convert buffer to base64 for cloudinary
      const base64Image = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({ error: "Failed to upload image" });
    }
  }

  const post = await Post.create({
    user: user._id,
    content: content || "",
    image: imageUrl,
  });

  res.status(201).json(new ApiResponse(201, post));
});

export const likePost = AsyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json(new ApiError(404, "User or Post Not Found"));

  const isLiked = post.likes.includes(user._id);

  if (isLiked) {
    // unlike
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: user._id },
    });
  } else {
    // like
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: user._id },
    });

    // create notification if not liking own post
    if (post.user.toString() !== user._id.toString()) {
      await Notification.create({
        from: user._id,
        to: post.user,
        type: "like",
        post: postId,
      });
    }
  }

  res.status(200).json(new ApiResponse(200 , isLiked ? "Post Unliked" : "Post Liked"));
});

export const deletePost = AsyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post)
      return res.status(404).json(new ApiError(404, "User or Post Not Found"));

    if (post.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to delete this post"));
    }

    // delete all comments on this post
    await Comment.deleteMany({ post: postId });

    // delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json(new ApiResponse(200, "Post deleted successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Error While Deleting Post"));
  }
});
