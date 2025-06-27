import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const educationPaymentSchema = new Schema(
  {
    user: {
      type: Types.ObjectId, // ✅ use Types from destructuring
      ref: 'User',
      required: true,
    },

    education: {
      type: Types.ObjectId, // ✅ use Types from destructuring
      ref: 'Education',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'GHS',
      required: true,
    },
   
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

educationPaymentSchema.plugin(toJSON);

export const EducationPaymentModel = model("EducationPayment", educationPaymentSchema);
