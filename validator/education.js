import Joi from "joi";

export const educationValidator = Joi.object({
  title: Joi.string().trim().min(3).required(),
  description: Joi.string().trim().min(10).required(),
  url: Joi.string().uri().optional(),
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
  title: Joi.string().trim().min(3),
  description: Joi.string().trim().min(10),
  url: Joi.string().uri(),
  media: Joi.array().items(
    Joi.object({
      type: Joi.string()
        .valid('image', 'video', 'document', 'audio')
        .required(),
      filename: Joi.string(),
      fileUrl: Joi.string().uri()
    })
  )
});
