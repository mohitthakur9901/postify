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

async function startApp () {
    connectDb().then(() => {
    if (ENV.PORT !== 'production') {
       app.listen(ENV.PORT|| 3000, () => {
        
        console.log(`server is running on http://localhost:${ENV.PORT}`);
    })
    }
}).catch((err) => {
    console.log(err);
    process.exit(1);
});
}

startApp();

export default app
