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
    paymentMethod: {
      type: String,
      enum: ['mobile_money', 'bank_transfer', 'card'],
      required: true,
    },
    paymentNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

educationPaymentSchema.plugin(toJSON);

export const EducationPaymentModel = model("EducationPayment", educationPaymentSchema);
