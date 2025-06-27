import Joi from 'joi';

export const paymentValidator = Joi.object({
  product: Joi.string().optional(),      // allow product if present
  education: Joi.string().optional(),    // allow education if present
  amount: Joi.number().positive().required(),
  currency: Joi.string().required(),
  quantity: Joi.number().integer().min(1),
});

export const updatePaymentValidator = Joi.object({
  amount: Joi.number().positive(),
  currency: Joi.string(),
  quantity: Joi.number().integer().min(1),
  status: Joi.string().valid('pending', 'completed', 'failed'),
});
