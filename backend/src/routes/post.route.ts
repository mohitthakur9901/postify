import express from "express";

import { protectRoute } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import {
  getPosts,
  createPost,
  deletePost,
  getPost,
  getUserPosts,
  likePost,
} from "../controller/post.controller.js";

const router = express.Router();

// public routes
router.get("/", getPosts);
router.get("/:postId", getPost);
router.get("/user/:username", getUserPosts);

// protected proteced
router.post("/", protectRoute, upload.single("image"), createPost);
router.post("/:postId/like", protectRoute, likePost);
router.delete("/:postId", protectRoute, deletePost);

export default router;
