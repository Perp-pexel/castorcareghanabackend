
import Joi from "joi";

export const reviewValidationSchema = Joi.object({
    rating:Joi.number().required(),
    comment:Joi.string()
})

export const updatReviewValidationSchema = Joi.object({
    rating:Joi.number().required(),
    comment:Joi.string()
})