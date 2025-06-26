import { EducationModel } from "../model/education.js";
import { educationValidator, updateEducationValidator } from "../validator/education.js";

// CREATE
export const addEducation = async (req, res, next) => {
  try {
    // Properly classify each uploaded file
    const media = req.files?.map(file => {
      let type = 'document';

      if (file.mimetype.startsWith('image/')) {
        type = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        type = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        type = 'audio';
      }

      return {
        type,
        filename: file.originalname || file.filename,
        fileUrl: file.secure_url || file.path || file.url,
      };
    });

    const { error, value } = educationValidator.validate({
      ...req.body,
      media: media?.length ? media : undefined,
    });

    if (error) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details,
      });
    }

    const newEducation = await EducationModel.create({
      ...value,
      user: req.auth.id,
    });

    res.status(201).json({
      message: "Education posted successfully!",
      data: newEducation,
    });
   } catch (error) {
    next(error);
  }
};



// READ ALL
export const getEducations = async (req, res, next) => {
  try {
    const { filter = "{}", sort = "{}", limit = 1000, skip = 0 } = req.query;

    const educations = await EducationModel
      .find(JSON.parse(filter))
      .sort(JSON.parse(sort))
      .limit(limit)
      .skip(skip);

    res.status(200).json(educations);
  } catch (error) {
    next(error);
  }
};

// READ ONE
export const getEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const education = await EducationModel.findById(id);
    if (!education) {
      return res.status(404).json("Education not found");
    }
    res.status(200).json(education);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateEducation = async (req, res, next) => {
  try {
    // Map uploaded files to media array
    const media = req.files?.map(file => {
      let type = 'document';

      if (file.mimetype.startsWith('image/')) {
        type = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        type = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        type = 'audio';
      }

      return {
        type,
        filename: file.originalname || file.filename,
        fileUrl: file.secure_url || file.path || file.url,
      };
    });

    // Validate with Joi
    const { error, value } = updateEducationValidator.validate({
      ...req.body,
      media: media?.length ? media : undefined,
    });

    if (error) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details,
      });
    }

    // Update record in DB
    const updatedEducation = await EducationModel.findOneAndUpdate(
      { _id: req.params.id, user: req.auth.id },
      value,
      { new: true }
    );

    if (!updatedEducation) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.status(200).json({
      message: "Education updated successfully!",
      data: updatedEducation,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteEducation = async (req, res, next) => {
  try {
    const deletedEducation = await EducationModel.findOneAndDelete({
      _id: req.params.id,
      user: req.auth.id,
    });

    if (!deletedEducation) {
      return res.status(404).json("Education not found");
    }

    res.status(200).json({
      message: "Education deleted successfully!",
      data: deletedEducation,
    });
  } catch (error) {
    next(error);
  }
};
