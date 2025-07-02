import { ProductModel } from "../model/product.js";
import { productValidator, updateProductValidator } from "../validator/product.js";
import { mailTransporter } from "../utils/mail.js";
import { registerEmailTemplate } from "../utils/emailTemplate.js";
import { UserModel } from "../model/user.js";


export const addProduct = async (req, res, next) => {
    try {
        const { error, value } = productValidator.validate({
            ...req.body,
            image: req.file?.filename
        });
        if (error) {
            return res.status(422).json(error);
        }
       const newProduct = await ProductModel.create({
            ...value,
            user: req.auth.id
        });
        const product = await ProductModel.findById(newProduct._id).populate("user");

        const emailContent = `
                        <p>Hi ${product.user.firstName}<p>
                                    <h4>New product added successfully on ${new Date().toDateString()}.</h4>
                                    <ul>
                                    <li>Name:  ${product.title}</li>
                                    <li>Price:  GHC ${product.price}</li>
                                    <li>Stock:  ${product.stock}${product.unit}</li>
                                    </ul>
                                    <p>Click the link below to view your product.</p>
                                    <a style="font-size: 14px; line-height: 1;"  target="_blank"; href="${process.env.CLIENT_URL}/product/${product._id}">${process.env.CLIENT_URL}/product/${product._id}</a>`
                        // Send professional a confirmation email
                        await mailTransporter.sendMail({
                            from: `Castor Care Ghana <${process.env.EMAIL_USER}`,
                            to: product.user.email,
                            subject: "Product Added",
                            replyTo: 'info@castorcareghana.com',
                            html: registerEmailTemplate(emailContent)
                        });

                            // 1. Get all users EXCEPT farmers
    const allUsers = await UserModel.find(
    { role: { $ne: 'farmer' } }, 
    'email firstName'           
    );

    // Broadcast to each user
    const emailBody = `
    <h4>New Product Available.</h4>
    <ul>
        <li>Name:  ${product.title}</li>
        <li>Price:  ${product.price}</li>
        <li>Stock:  ${product.stock}${product.unit}</li>
    </ul>
    
        <a style="font-size: 14px; line-height: 1;" href="${process.env.CLIENT_URL}/product/${product._id}" target="_blank">${process.env.CLIENT_URL}/product/${product._id}</a>
    </p>
    `;

    for (const user of allUsers) {
    await mailTransporter.sendMail({
        from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `New Product: ${product.title}`,
        replyTo: 'info@castorcareghana.com',
        html: registerEmailTemplate(`
        <p>Hi ${user.firstName || 'there'},</p>
        ${emailBody}
        `),
    });
    }

        res.status(201).json({
      message: "Product added successfully!", product
    });
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
            .populate("user");
        res.status(200).json(products)
    } catch (error) {
        next(error);
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await ProductModel.findById(id).populate("user");
        res.json(product)
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { error, value } = updateProductValidator.validate({
            ...req.body,
            image: req.file?.filename
        });
        if (error) {
            return res.status(422).json(error);
        }
        const updatedProduct = await ProductModel.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.auth.id
            },
            value,
            { new: true }
        ).populate("user");
        if (!updateProduct) {
            res.status(404).json("Product not found");
        }

        const emailContent = `
                        <p>Hi ${updatedProduct.user.firstName}<p>
                                    <h4>Product updated successfully on ${new Date().toDateString()}.</h4>
                                    <ul>
                                    <li>Name:  ${updatedProduct.title}</li>
                                    <li>Price:  GHC${updatedProduct.price}</li>
                                    <li>Stock:  ${updatedProduct.stock}${updatedProduct.unit}</li>
                                    </ul>
                                    <p>Click the link below to view your product.</p>
                                    <a style="font-size: 14px; line-height: 1;"  target="_blank"; href="${process.env.CLIENT_URL}/product/${updatedProduct._id}">${process.env.CLIENT_URL}/product/${updatedProduct._id}</a>`
                        // Send professional a confirmation email
                        await mailTransporter.sendMail({
                            from: `Castor Care Ghana <${process.env.EMAIL_USER}`,
                            to: updatedProduct.user.email,
                            subject: "Product Update",
                            replyTo: 'info@castorcareghana.com',
                            html: registerEmailTemplate(emailContent)
                        });
                        // Fetch users except farmers
    const users = await UserModel.find({ role: { $ne: 'farmer' } }, 'email firstName');

    // Build product update message
    const productBody = `
    <h4>Check out on updated product.</h4>
<ul>
        <li>Name: ${updatedProduct.title}</li>
        <li>Price: GHC${updatedProduct.price}</li>
        <li>Stock: ${updatedProduct.stock}${updatedProduct.unit}</li>
    </ul>
    <p>
        <a style="font-size: 14px; line-height: 1;" href="${process.env.CLIENT_URL}/product/${updatedProduct._id}" target="_blank">
        ${process.env.CLIENT_URL}/product/${updatedProduct._id}
        </a>
    </p>
    `;

    // Send email to each user
    for (const user of users) {
    await mailTransporter.sendMail({
        from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `New Product: ${updatedProduct.title}`,
        replyTo: 'info@castorcareghana.com',
        html: registerEmailTemplate(`
        <p>Hi ${user.firstName || 'there'},</p>
        ${productBody}
        `),
    });
    }

        res.status(200).json({
      message: "Product updated successfully!", updatedProduct
    });

    } catch (error) {
        next(error)
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const deletedProduct = await ProductModel.findOneAndDelete(
            {
                _id: req.params.id,
                user: req.auth.id
            }).populate("user");

        if (!deleteProduct) {
            return res.status(422).json("Product not found")

        }
        res.status(200).json({
      message: "Product deleted successfully!",
      data: deletedProduct,
    });
    } catch (error) {
        next(error);
    }
};
