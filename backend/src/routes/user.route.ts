import express from "express"
import { followUser, getCurrentUser, getUserProfile, syncUser, updateProfile } from "../controller/user.controller";
import { protectRoute } from "../middleware/auth.middleware";
const router = express.Router()



router.get("/profile/:username" , getUserProfile)

router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.put("/profile", protectRoute, updateProfile);
router.post("/follow/:targetUserId", protectRoute, followUser);





export default router;