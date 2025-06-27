import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const productPaymentSchema = new Schema(
  {
    user: {
      type: Types.ObjectId, // ✅ use Types from destructuring
      ref: 'User',
      required: true,
    },

    product: {
      type: Types.ObjectId, // ✅ use Types from destructuring
      ref: 'Product',
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

productPaymentSchema.plugin(toJSON);

export const ProductPaymentModel = model("ProductPayment", productPaymentSchema);
