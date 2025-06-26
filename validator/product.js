import Joi from "joi";

export const productValidator = Joi.object ({
    title: Joi.string().required(),
    unit: Joi.string().required(),
    image: Joi.string().required(),
    price: Joi.string().required()
});

export const updateProductValidator = Joi.object ({
    title: Joi.string(),
    unit: Joi.string(),
    image: Joi.string(),
    price: Joi.string()
});