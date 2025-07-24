import express from "express";
import cors from "cors";
import { ENV } from "./configs/env";
import connectDb from "./configs/db";
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

connectDb().then(() => {
    app.listen(ENV.PORT|| 3000, () => {
        
        console.log(`server is running on http://localhost:${ENV.PORT}`);
    })
    app.on("error", (err: any) => {
        console.log(err);
    })
}).catch((err) => {
    console.log(err);
    process.exit(1);
});