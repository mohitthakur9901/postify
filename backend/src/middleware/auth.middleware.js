import { getAuth } from "@clerk/express";

export const protectRoute = (req, res, next) => {
  const { userId, sessionId, getToken } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }

  req.userId = userId;
  req.sessionId = sessionId;
  req.getToken = getToken;

  next();
};
