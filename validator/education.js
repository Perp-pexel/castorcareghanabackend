import Joi from "joi";

export const educationValidator = Joi.object({
  title: Joi.string().trim().min(3).required(),
  description: Joi.string().trim().min(10).required(),
  url: Joi.string().uri().allow('').optional(),
  fee: Joi.string().allow('').optional(),
  media: Joi.array().items(
    Joi.object({
      type: Joi.string()
        .valid('image', 'video', 'document', 'audio'),
      filename: Joi.string(),
      fileUrl: Joi.string().uri()
    })
  ).optional()
});


export const updateEducationValidator = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  url: Joi.string().uri().allow(null, ''),         // URL is optional
  fee: Joi.string().allow(null, ''),               // Fee is optional
  media: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('image', 'video', 'audio', 'document').required(),
      filename: Joi.string().required(),
      fileUrl: Joi.string().uri().required()
    })
  ).required() // Media is required (must be empty array if none)
});



