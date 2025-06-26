import { UserModel } from "../model/user.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logInUserValidator, registerUserValidator, updateProfileValidator } from "../validator/user.js";
import { mailTransporter } from "../utils/mail.js";
import { ProductModel } from "../model/product.js";

export const registerUser = async (req, res, next) => {
    try {
        const { error, value } = registerUserValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        const user = await UserModel.findOne({ email: value.email });
        if (user) {
            return res.status(409).json('user already exist!');
        }

        const hashedPassword = bcrypt.hashSync(value.password, 10)

        await UserModel.create({
            ...value,
            password: hashedPassword
        });

        await mailTransporter.sendMail({
            to: value.email,
            subject: 'User Registration',
            text: 'Account registered successfully'
        });


        res.json('Registered user!')
    } catch (error) {
        next(error);
    }
}


export const logInUser = async (req, res, next) => {
    try {
        const { error, value } = logInUserValidator.validate(req.body)
        if (error) {
            return res.status(422).json(error);
        }

        const user = await UserModel.findOne({ email: value.email });
        if (!user) {
            return res.status(404).json('User does not exist!')
        }

        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json('Invalid credentials!')
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'User checked in!',
            accessToken: token
        });
        // res.json('User checked in')
    } catch (error) {
        next(error);
    }
}

export const getProfile = async (req, res, next) => {
    try {
        console.log(req.auth);

        const user = await UserModel

            .findById(req.auth.id)
            .select({ password: false });
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export const getAllProfile= async(req, res, next) => {
    try {
     const user = await UserModel
     .find()
     .select({ password: false });
      res.status(200).json(user);
    } catch (error) {
     next (error); 
    }
 }

export const getUserProducts = async (req, res, next) => {
    try {
        const { filter = "{}", sort = "{}", limit = 10, skip = 0 } = req.query;

        const products = await ProductModel
            .find({
                ...JSON.parse(filter),
                user: req.auth.id
            })
            .sort(JSON.parse(sort))
            .limit(limit)
            .skip(skip)
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

export const logOutUser = (req, res, next) => {
    res.json('User checked out')
}

// export const updateProfile= async (req, res, next) => {
//     try {
//         // Validate user input
//                 const {error, value} = updateProfileValidator.validate({
//                     ...req.body,
//                     avatar: req.file?.filename
//                 });
//                 if (error) {
//                     return res.status(422).json(error);
//                 }
//                 const updateProfile = await UserModel.findOneAndUpdate(
//                     {
//                         _id: req.params.id,
//                         user: req.auth.id
//                     },
//                     value,
//                     { new: true }
//                 );
//                 if (!updateProfile) {
//                     res.status(404).json("User not found");
//                 };
//         res.status(200).json({message:'User profile updated', user})
//     } catch (error) {
//         next (error);  
//     }
// }

export const updateProfile = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = updateProfileValidator.validate({
      ...req.body,
      avatar: req.file?.filename,
    });

    if (error) {
      return res.status(422).json(error);
    }

    // Use either authenticated ID or param ID
    const userId = req.params.id || req.auth?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided' });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, value, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile updated', user: updatedUser });
  } catch (error) {
    next(error);
  }
};
