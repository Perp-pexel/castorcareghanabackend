
import { ReviewModel } from "../model/review.js";
import { reviewValidationSchema, updatReviewValidationSchema } from "../validator/review.js";

export const addReview = async (req, res, next) => {
       try {
         // validator
         const {error, value} = reviewValidationSchema.validate(req.body);
         if (error) {
             return res.status(422).json(error);
         }

       const newReview = await ReviewModel.create(req.body);
        res.status(200).json({
      message: "Review added successfully!",
      data: newReview,
    });
       } catch (error) {
        next(error);
        
       }

}

export const getAllReviews = async(req, res, next) => {
       try {

       const reviews = await ReviewModel.find(req.body);
         res.json (reviews);
       } catch (error) {
        next (error);
        
       }
}

export const getOneReview = async(req, res, next) => {
    try {
        const reviews = await ReviewModel.findById(req.params.id);
        res.status(200).json (reviews);
    } catch (error) {
        next(error)
    }
}


export const updateReview = async (req, res, next) => {
    try {

         // validator
         const {error, value} = updatReviewValidationSchema.validate(req.body);
         if (error) {
             return res.status(422).json(error);
         }
      const updatedReview = await ReviewModel.findByIdAndUpdate(req.params.id)
        res.status(200).json({
      message: "Education updated successfully!",
      data: updatedReview,
    });
    } catch (error) {
        next(error);

    }
}


export const deleteReview = async (req, res, next) => {

    try {
 const deletedReview = await ReviewModel.findByIdAndUpdate(req.params.id)
        res.status(200).json({
      message: "Education updated successfully!",
      data: deletedReview,
    });

    } catch (error) {
        next(error)

    }

}