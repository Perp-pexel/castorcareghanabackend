import { Router } from "express";
import {
    createEducationPayment,
    getAllEducationPayments,
    getEducationPaymentById,
    updateEducationPayment,
    deleteEducationPayment,
} from "../controller/educationPayment.js ";


import { isAuthenticated } from "../middleware/authenticator.js";


const educationPaymentRouter = Router();

educationPaymentRouter.post('/pay/education', isAuthenticated, createEducationPayment);
educationPaymentRouter.get('/pay/education', getAllEducationPayments);
educationPaymentRouter.get('/pay/education/:id', getEducationPaymentById);
educationPaymentRouter.patch('/pay/education/:id', isAuthenticated, updateEducationPayment);
educationPaymentRouter.delete('/pay/education/:id', isAuthenticated, deleteEducationPayment);

export default educationPaymentRouter

