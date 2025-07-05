import { toJSON } from "@reis/mongoose-to-json";
import { Schema, model } from "mongoose";

const userSchema =new Schema({
    firstName: {type: String, required:true },
    lastName: { type: String, required:true },
    email: { type:String, required:true, unique:true },
    contact: { type: String, required: true},
    password: { type:String, required:true},
    // repeat_password: { type:String, ref:'password' },
    avatar: { type: String },
    role: { type: String, default: 'user', enum: ['buyer', 'farmer', 'admin', 'superadmin'] },
    resetPasswordToken: String,
    resetPasswordExpire: Date

}, {
    timestamps: true
});

userSchema.plugin(toJSON)

export const UserModel = model('User', userSchema);