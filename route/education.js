import { Router } from "express";
import { educationMediaUpload } from "../middleware/uploads.js";
import { addEducation, getEducations, getEducation, updateEducation, deleteEducation } from "../controller/education.js";
import { isAuthenticated } from "../middleware/authenticator.js";


const educationRouter = Router();

// productRouter.post("/products",isAuthenticated, productImageUpload.single("image"), addProduct);

educationRouter.post("/educations", isAuthenticated, educationMediaUpload.array("media"), addEducation);

educationRouter.get("/educations",  getEducations);

educationRouter.get("/educations/:id", getEducation);

educationRouter.patch("/educations/:id", isAuthenticated, educationMediaUpload.array("media"), updateEducation);

educationRouter.delete("/educations/:id", isAuthenticated, deleteEducation);

export default educationRouter