import { Router} from "express";
import { addReview, getAllReviews, getOneReview, updateReview, deleteReview } from "../controller/review.js";

const reviewRouter = Router();

reviewRouter.post('/reviews', addReview);

reviewRouter.get('/reviews', getAllReviews);

reviewRouter.get('/reviews/:id', getOneReview);

reviewRouter.patch('/reviews/:id', updateReview);

reviewRouter.delete('/reviews/:id', deleteReview);

export default reviewRouter;