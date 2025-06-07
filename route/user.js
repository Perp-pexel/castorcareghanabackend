import { Router } from "express";
import { getProfile, getUserProducts, logInUser, logOutUser, registerUser, updateProfile } from "../controller/user.js";
import { hasPermission, isAuthenticated } from "../middleware/authenticator.js";
import { userAvatarUpload } from "../middleware/uploads.js";

const userRouter = Router();

userRouter.post('/users/register', registerUser);

userRouter.post('/users/login', logInUser);

userRouter.get('/users/me', isAuthenticated, hasPermission('get_profile'), getProfile);

userRouter.post('/users/logout', isAuthenticated, logOutUser);

userRouter.get('/users/me/products', isAuthenticated, getUserProducts);

userRouter.patch('/users/me', isAuthenticated, hasPermission('update_profile'), userAvatarUpload.single('avatar'), updateProfile)

export default userRouter;