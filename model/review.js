import { Schema, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const reviewSchema = new Schema({
    rating: {type: Number, required: true},
    comment: {type: String}
});

reviewSchema.plugin(toJSON)

export const ReviewModel = model('Review', reviewSchema)