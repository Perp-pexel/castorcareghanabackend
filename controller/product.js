import { ProductModel } from "../model/product.js";
import { productValidator, updateProductValidator } from "../validator/product.js";

export const addProduct = async (req, res, next) => {
    try {
        const { error, value } = productValidator.validate({
            ...req.body,
            image: req.file?.filename
        });
        if (error) {
            return res.status(422).json(error);
        }
        await ProductModel.create({
            ...value,
            user: req.auth.id
        });
        res.status(201).json("Product posted successfully!")
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const { filter = "{}", sort = "{}", limit = 1000, skip = 0 } = req.query;

        const products = await ProductModel
            .find(JSON.parse(filter))
            .sort(JSON.parse(sort))
            .limit(limit)
            .skip(skip)
        res.status(200).json(products)
    } catch (error) {
        next(error);
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await ProductModel.findById(id);
        res.json(product)
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { error, value } = updateAdvertValidator.validate({
            ...req.body,
            image: req.file?.filename
        });
        if (error) {
            return res.status(422).json(error);
        }
        const updateProduct = await ProductModel.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.auth.id
            },
            value,
            { new: true }
        );
        if (!updateProduct) {
            res.status(404).json("Product not found");
        }
        res.status(200).json(updateProduct);

    } catch (error) {
        next(error)
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const deleteProduct = await ProductModel.findOneAndDelete(
            {
                _id: req.params.id,
                user: req.auth.id
            });

        if (!deleteProduct) {
            return res.status(422).json("Product not found")

        }
        res.status(200).json(deleteProduct)
    } catch (error) {
        next(error);
    }
};
