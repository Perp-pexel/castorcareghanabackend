import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const paymentSchema = new Schema(
  {
    user: {
      type: Types.ObjectId, // ✅ use Types from destructuring
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['product', 'education'],
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
    quantity: {
      type: Number,
      required: true,
    },
    reference: {
      type: Types.ObjectId,
      required: true,
      refPath: 'category',
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

paymentSchema.plugin(toJSON);

export const PaymentModel = model("Payment", paymentSchema);
