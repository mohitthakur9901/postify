import express from "express";
import cors from "cors";
import connectDb from "./configs/db";
import { clerkMiddleware } from "@clerk/express";
import { arcjetMiddleware } from "./middleware/arcject.middleware";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
// routes import 

import UserRoute from "./routes/user.route"
import PostRoute from "./routes/post.route"
import CommentRoute from "./routes/comment.route"
import NotificationRoute from "./routes/notification.route"


const app = express();
dotenv.config({
    path: "../.env"
})

app.use(express.json());
app.use(cors());

app.use(clerkMiddleware());
app.use(arcjetMiddleware);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.get("/health", (req, res) => {
  res.send("Server is up and running!");
});

// routes
app.use('/api/user', UserRoute); 
app.use('/api/post', PostRoute);
app.use('/api/comment', CommentRoute);
app.use('/api/notification', NotificationRoute);

const startServer = async () => {
  try {
    await connectDb();

    // listen for local development
    if (process.env.NODE_ENV !== "production") {
      app.listen(process.env.PORT, () => console.log("Server is up and running on PORT:", process.env.PORT));
    }
  } catch (error : any) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// export for vercel
export default app;