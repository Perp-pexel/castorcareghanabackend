import express from "express";
import mongoose from "mongoose";
import userRouter from "./route/user.js";
import productRouter from "./route/product.js";
import reviewRouter from "./route/review.js";
import cors from "cors"

// connect to database
await mongoose.connect(process.env.MONGO_URI);

// create an express app
const app = express();

// use middlewares
app.use(cors());
app.use(express.json());

// use routes
app.use(userRouter);
app.use(productRouter);
app.use(reviewRouter);


// listen to incoming request
app.listen(process.env.PORT, () => {
    console.log(`App is listening on port ${process.env.PORT}`);

});