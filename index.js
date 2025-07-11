import express from "express";
import mongoose from "mongoose";
import userRouter from "./route/user.js";
import productRouter from "./route/product.js";
import reviewRouter from "./route/review.js";
import educationRouter from "./route/education.js";
import productPaymentRouter from "./route/productPayment.js";
import educationPaymentRouter from "./route/educationPayment.js";
import formRouter from "./route/form.js";
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
app.use(educationRouter);
app.use(productPaymentRouter);
app.use(educationPaymentRouter);
app.use(formRouter);


// listen to incoming request
app.listen(process.env.PORT, () => {
    console.log(`App is listening on port ${process.env.PORT}`);

});