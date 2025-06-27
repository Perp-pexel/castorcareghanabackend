import { Router } from 'express';
import {
  createProductPayment,
  getAllProductPayments,
  getProductPaymentById,
  updateProductPayment,
  deleteProductPayment,
} from '../controller/productPayment.js ';
import { isAuthenticated } from '../middleware/authenticator.js';

const productPaymentRouter = Router();

productPaymentRouter.post('/pay/product', isAuthenticated, createProductPayment);
productPaymentRouter.get('/pay/product', getAllProductPayments);
productPaymentRouter.get('/pay/product/:id', getProductPaymentById);
productPaymentRouter.patch('/pay/product/:id', isAuthenticated, updateProductPayment);
productPaymentRouter.delete('/pay/product/:id', isAuthenticated, deleteProductPayment);

export default productPaymentRouter;