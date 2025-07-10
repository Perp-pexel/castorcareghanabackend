import { ProductModel } from "../model/product.js";
import { productValidator, updateProductValidator } from "../validator/product.js";
import { mailTransporter } from "../utils/mail.js";
import { registerEmailTemplate } from "../utils/emailTemplate.js";
import { UserModel } from "../model/user.js";

// ADD PRODUCT
export const addProduct = async (req, res, next) => {
  try {
    if (req.auth.role === 'buyer') {
      return res.status(403).json({ message: "Buyers are not allowed to create products" });
    }

    const { error, value } = productValidator.validate({
      ...req.body,
      image: req.file?.filename,
    });

    if (error) return res.status(422).json(error);

    const newProduct = await ProductModel.create({
      ...value,
      user: req.auth.id,
    });

    const product = await ProductModel.findById(newProduct._id).populate("user");

    // Send confirmation email to owner
    const ownerEmailContent = `
      <p>Hi ${product.user.firstName}</p>
      <h4>New product added on ${new Date().toDateString()}.</h4>
      <ul>
        <li>Name: ${product.title}</li>
        <li>Price: GHC ${product.price}</li>
        <li>Stock: ${product.stock}${product.unit}</li>
      </ul>
      <p>Click below to view:</p>
      <a href="${process.env.CLIENT_URL}/product/${product._id}" target="_blank">${process.env.CLIENT_URL}/product/${product._id}</a>`;

    await mailTransporter.sendMail({
      from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
      to: product.user.email,
      subject: "Product Added",
      replyTo: 'info@castorcareghana.com',
      html: registerEmailTemplate(ownerEmailContent),
    });

    // Determine who should be notified
    let notifyUsers = [];

    if (product.user.role === 'farmer') {
      notifyUsers = await UserModel.find({ role: { $in: ['admin', 'superadmin'] } }, 'email firstName');
    } else {
      notifyUsers = await UserModel.find({ role: { $ne: 'farmer' } }, 'email firstName');
    }

    const emailBody = `
      <h4>New Product Available</h4>
      <ul>
        <li>Name: ${product.title}</li>
        <li>Price: GHC ${product.price}</li>
        <li>Stock: ${product.stock}${product.unit}</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/product/${product._id}" target="_blank">${process.env.CLIENT_URL}/product/${product._id}</a>`;

    for (const user of notifyUsers) {
      await mailTransporter.sendMail({
        from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `New Product: ${product.title}`,
        replyTo: 'info@castorcareghana.com',
        html: registerEmailTemplate(`<p>Hi ${user.firstName || 'there'},</p>${emailBody}`),
      });
    }

    res.status(201).json({ message: "Product added successfully!", product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { filter = "{}", sort = "{}", limit = 1000, skip = 0 } = req.query;
    const parsedFilter = JSON.parse(filter);

    const role = req.auth?.role;
    const userId = req.auth?.id;

    if (!role) {
      // Guest (not signed in): hide farmer products
      const farmers = await UserModel.find({ role: 'farmer' }, '_id');
      parsedFilter.user = { $nin: farmers.map(f => f._id) };
    } else if (role === 'farmer') {
      // Farmers see only their own
      parsedFilter.user = userId;
    } else if (role === 'buyer') {
      // Authenticated buyer: hide farmer products
      const farmers = await UserModel.find({ role: 'farmer' }, '_id');
      parsedFilter.user = { $nin: farmers.map(f => f._id) };
    }

    const products = await ProductModel
      .find(parsedFilter)
      .sort(JSON.parse(sort))
      .limit(limit)
      .skip(skip)
      .populate("user");

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = req.auth?.role;
    const userId = req.auth?.id;

    const product = await ProductModel.findById(id).populate("user");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productOwnerId = String(product.user?._id);
    const productOwnerRole = product.user?.role;

    if (!role) {
      // Unauthenticated guest
      if (productOwnerRole === 'farmer') {
        return res.status(403).json({ message: "Access denied to this product" });
      }
    } else if (role === 'buyer') {
      // Authenticated buyer
      if (productOwnerRole === 'farmer') {
        return res.status(403).json({ message: "Access denied to this product" });
      }
    } else if (role === 'farmer') {
      // Farmer can only see their own
      if (userId !== productOwnerId) {
        return res.status(403).json({ message: "Access denied to this product" });
      }
    }
    // Admin and Superadmin bypass restrictions

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};


// UPDATE PRODUCT
export const updateProduct = async (req, res, next) => {
  try {
    const { error, value } = updateProductValidator.validate({
      ...req.body,
      image: req.file?.filename,
    });
    if (error) return res.status(422).json(error);

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: req.params.id, user: req.auth.id },
      value,
      { new: true }
    ).populate("user");

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    // Notify product owner
    const emailContent = `
      <p>Hi ${updatedProduct.user.firstName}</p>
      <h4>Your product was updated on ${new Date().toDateString()}.</h4>
      <ul>
        <li>Name: ${updatedProduct.title}</li>
        <li>Price: GHC${updatedProduct.price}</li>
        <li>Stock: ${updatedProduct.stock}${updatedProduct.unit}</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/product/${updatedProduct._id}" target="_blank">${process.env.CLIENT_URL}/product/${updatedProduct._id}</a>`;

    await mailTransporter.sendMail({
      from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
      to: updatedProduct.user.email,
      subject: "Product Updated",
      replyTo: 'info@castorcareghana.com',
      html: registerEmailTemplate(emailContent),
    });

    // Who to notify
    let notifyUsers = [];

    if (updatedProduct.user.role === 'farmer') {
      notifyUsers = await UserModel.find({ role: { $in: ['admin', 'superadmin'] } }, 'email firstName');
    } else {
      notifyUsers = await UserModel.find({ role: { $ne: 'farmer' } }, 'email firstName');
    }

    const productBody = `
      <h4>Product Updated</h4>
      <ul>
        <li>Name: ${updatedProduct.title}</li>
        <li>Price: GHC${updatedProduct.price}</li>
        <li>Stock: ${updatedProduct.stock}${updatedProduct.unit}</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/product/${updatedProduct._id}" target="_blank">${process.env.CLIENT_URL}/product/${updatedProduct._id}</a>`;

    for (const user of notifyUsers) {
      await mailTransporter.sendMail({
        from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Product Updated: ${updatedProduct.title}`,
        replyTo: 'info@castorcareghana.com',
        html: registerEmailTemplate(`<p>Hi ${user.firstName || 'there'},</p>${productBody}`),
      });
    }

    res.status(200).json({
      message: "Product updated successfully!",
      updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await ProductModel.findOneAndDelete({
      _id: req.params.id,
      user: req.auth.id,
    }).populate("user");

    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: "Product deleted successfully!",
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};
