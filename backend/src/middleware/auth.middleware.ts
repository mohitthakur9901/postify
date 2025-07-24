export const protectRoute = async (req : any, res : any, next : any) => {
  if (!req.auth().isAuthenticated) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }
  next();
};