// --- controller/educationController.js ---
import { EducationPaymentModel } from '../model/educationPayment.js';
import { paymentValidator, updatePaymentValidator } from '../validator/payment.js';

export const createEducationPayment = async (req, res, next) => {
  try {
    const { error, value } = paymentValidator.validate(req.body);
    if (error) return res.status(422).json({ message: 'Validation failed', details: error.details });

    const newPayment = await EducationPaymentModel.create({ ...value, user: req.auth?.id || null });
    const populated = await EducationPaymentModel.findById(newPayment._id)
      .populate('education')
      .populate('user');

    res.status(201).json({ message: 'Education payment created!', data: populated });
  } catch (err) { next(err); }
};

export const getAllEducationPayments = async (req, res, next) => {
  try {
    const payments = await EducationPaymentModel.find()
      .populate('education')
      .populate('user');
    res.status(200).json({ data: payments });
  } catch (err) { next(err); }
};

export const getEducationPaymentById = async (req, res, next) => {
  try {
    const payment = await EducationPaymentModel.findById(req.params.id)
      .populate('education')
      .populate('user');
    if (!payment) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ data: payment });
  } catch (err) { next(err); }
};

export const updateEducationPayment = async (req, res, next) => {
  try {
    const { error, value } = updatePaymentValidator.validate(req.body);
    if (error) return res.status(422).json({ message: 'Validation failed', details: error.details });

    const updated = await EducationPaymentModel.findByIdAndUpdate(req.params.id, value, { new: true })
      .populate('education')
      .populate('user');
    res.status(200).json({ message: 'Education payment updated!', data: updated });
  } catch (err) { next(err); }
};

export const deleteEducationPayment = async (req, res, next) => {
  try {
    await EducationPaymentModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Education payment deleted.' });
  } catch (err) { next(err); }
};
