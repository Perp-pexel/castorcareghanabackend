import Joi from "joi";

export const registerUserValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    contact: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('buyer', 'farmer', 'admin')
});

export const logInUserValidator = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email().required(),
    contact: Joi.string(),
    password: Joi.string().required(),
});


export const updateProfileValidator = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    contact: Joi.string(),
    avatar: Joi.string(),
    password: Joi.string(), 
});