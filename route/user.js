import { Router } from "express";
import { getProfile, getAllProfile, getUserProducts, logInUser, logOutUser, registerUser, updateProfile, forgotPassword, resetPassword } from "../controller/user.js";
import { isAuthenticated } from "../middleware/authenticator.js";
import { userAvatarUpload } from "../middleware/uploads.js";

const userRouter = Router();

userRouter.post('/users/register', registerUser);

userRouter.post('/users/login', logInUser);

userRouter.get('/users/me', isAuthenticated, getProfile);

userRouter.get('/users', isAuthenticated, getAllProfile);

userRouter.post('/users/logout', isAuthenticated, logOutUser);

userRouter.get('/users/me/products', isAuthenticated, getUserProducts);

userRouter.patch('/users/me', isAuthenticated, userAvatarUpload.single('avatar'), updateProfile);

userRouter.post('/users/forgot-password', forgotPassword);

userRouter.post('/users/reset-password/:token', resetPassword);


export default userRouter;