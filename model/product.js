import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";


const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, enum: ['kg','g','l','ml','pck','each','pcs', 'pound', 'box'] },
    image: { type: String, required: true },
    price: { type: String, required: true },
    user: { type: Types.ObjectId, required: true, ref: 'User' }
}, {
    timestamps: true
})

productSchema.plugin(toJSON);

export const ProductModel = model("Product", productSchema)