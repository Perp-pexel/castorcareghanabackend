import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";


const productSchema = new Schema({
    title: { type: String, required: true },
    unit: { type: String, enum: ['kg','g','liter','ml','pck','each','pcs', 'pound', 'box'] },
    image: { type: String, required: true },
    price: { type: String, required: true },
    stock: { type: Number, required: true },
    user: { type: Types.ObjectId, required: true, ref: 'User' }
}, {
    timestamps: true
})

productSchema.plugin(toJSON);

export const ProductModel = model("Product", productSchema)