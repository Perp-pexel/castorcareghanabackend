// --- controller/productController.js ---
import { ProductPaymentModel } from '../model/productPayment.js';
import { paymentValidator, updatePaymentValidator } from '../validator/payment.js';

export const createProductPayment = async (req, res, next) => {
  try {
    const { error, value } = paymentValidator.validate(req.body);
    if (error) return res.status(422).json({ message: 'Validation failed', details: error.details });

    const newPayment = await ProductPaymentModel.create({ ...value, user: req.auth?.id || null });
    const populated = await ProductPaymentModel.findById(newPayment._id)
      .populate('product')
      .populate('user');

    res.status(201).json({ message: 'Product payment created!', data: populated });
  } catch (err) { next(err); }
};

export const getAllProductPayments = async (req, res, next) => {
  try {
    const payments = await ProductPaymentModel.find()
      .populate('product')
      .populate('user');
    res.status(200).json({ data: payments });
  } catch (err) { next(err); }
};

export const getProductPaymentById = async (req, res, next) => {
  try {
    const payment = await ProductPaymentModel.findById(req.params.id)
      .populate('product')
      .populate('user');
    if (!payment) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ data: payment });
  } catch (err) { next(err); }
};

export const updateProductPayment = async (req, res, next) => {
  try {
    const { error, value } = updatePaymentValidator.validate(req.body);
    if (error) return res.status(422).json({ message: 'Validation failed', details: error.details });

    const updated = await ProductPaymentModel.findByIdAndUpdate(req.params.id, value, { new: true })
      .populate('product')
      .populate('user');
    res.status(200).json({ message:'Product payment updated!', data: updated });
  } catch (err) { next(err); }
};

export const deleteProductPayment = async (req, res, next) => {
  try {
    await ProductPaymentModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product payment deleted.' });
  } catch (err) { next(err); }
};