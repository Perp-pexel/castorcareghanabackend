import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const educationSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    fee: { type: String },
    url: { type: String}, 
    user: { type: Types.ObjectId, required: true, ref: 'User' },
    media: [
        {
            type: {
                type: String,
                enum: ['image', 'video', 'document', 'audio']    
            },
            filename: String,
            fileUrl: String
        }
    ]
}, {
    timestamps: true
});

educationSchema.plugin(toJSON);

export const EducationModel = model("Education", educationSchema);

