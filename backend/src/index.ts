import express from "express";
import cors from "cors";
const app = express();



app.use(express.json());
app.use(cors());



app.get("/", (req, res) => {
    res.send("Hello from the backend!");
});




app.listen(3000, () => {
    console.log("Server started on port 3000");
});