export const protectRoute = async (req, res, next) => {
  console.log("Auth object:", req.auth);

  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }
  next();
};
