import express from "express";
import cors from "cors";
import { ENV } from "./configs/env";
import connectDb from "./configs/db";
import { clerkMiddleware, User } from "@clerk/express";
import { arcjetMiddleware } from "./middleware/arcject.middleware";


// routes import 

import UserRoute from "./routes/user.route"
import PostRoute from "./routes/post.route"
import CommentRoute from "./routes/comment.route"
import NotificationRoute from "./routes/notification.route"
const app = express();

app.use(express.json());
app.use(cors());

app.use(clerkMiddleware());
app.use(arcjetMiddleware);

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});


// routes
app.use('api/user' , UserRoute);
app.use('api/post' , PostRoute);
app.use('api/comment' , CommentRoute);
app.use('api/notification' , NotificationRoute);

const startServer = async () => {
  try {
    await connectDb();

    // listen for local development
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));
    }
  } catch (error : any) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// export for vercel
export default app;