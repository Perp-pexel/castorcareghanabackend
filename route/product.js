import { Router } from "express";
import { addProduct, deleteProduct, getProducts, getProduct, updateProduct } from "../controller/product.js";
import { isAuthenticated } from "../middleware/authenticator.js";
import { productImageUpload } from "../middleware/uploads.js";

// create routes
const productRouter = Router();

// define routes
productRouter.post("/products",isAuthenticated, productImageUpload.single("image"), addProduct);

productRouter.get("/products", getProducts);

productRouter.get("/products/:id", getProduct);

productRouter.patch("/products/:id", isAuthenticated, productImageUpload.single("image"), updateProduct);

productRouter.delete("/products/:id", isAuthenticated, deleteProduct);

// export router
export default productRouter;