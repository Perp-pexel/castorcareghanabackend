import { EducationModel } from "../model/education.js";
import { educationValidator, updateEducationValidator } from "../validator/education.js";
import { mailTransporter } from "../utils/mail.js";
import { registerEmailTemplate } from "../utils/emailTemplate.js";
import { UserModel } from "../model/user.js";


export const addEducation = async (req, res, next) => {
  try {
    // STEP 1: Properly extract and categorize uploaded media files
    const media = req.files?.map(file => {
      let type = 'document';

      if (file.mimetype.startsWith('image/')) type = 'image';
      else if (file.mimetype.startsWith('video/')) type = 'video';
      else if (file.mimetype.startsWith('audio/')) type = 'audio';

      return {
        type,
        filename: file.originalname || file.filename,
        fileUrl: file.secure_url || file.path || file.url || '',
      };
    }) || [];

    // STEP 2: Validate all required fields and media
    const { error, value } = educationValidator.validate({
      ...req.body,
      media: media.length > 0 ? media : undefined,
    });

    if (error) {
      return res.status(422).json({
        message: 'Validation failed',
        details: error.details,
      });
    }

    // STEP 3: Create and store the education resource
    const newEducation = await EducationModel.create({
      ...value,
      user: req.auth.id, // Assumes auth middleware sets req.auth.id
      media,
    });

    // STEP 4: Populate user for response and email notification
    const education = await EducationModel.findById(newEducation._id).populate('user');

    // STEP 5: Notify creator by email
    const creatorEmail = `
      <p>Hi ${education.user.firstName},</p>
      <h4>Your education resource has been added on ${new Date().toDateString()}.</h4>
      <ul>
        <li><strong>Title:</strong> ${education.title}</li>
        <li><strong>Fee:</strong> ${education.fee ? `GHS ${education.fee}` : 'Free'}</li>
        <li><strong>URL:</strong> <a href="${education.url}" target="_blank">${education.url}</a></li>
      </ul>
      <p>Click to view your resource:</p>
      <a href="${process.env.CLIENT_URL}/education/${education._id}" target="_blank">
        ${process.env.CLIENT_URL}/education/${education._id}
      </a>
    `;

    await mailTransporter.sendMail({
      from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
      to: education.user.email,
      subject: 'Education Added Successfully',
      replyTo: 'info@castorcareghana.com',
      html: registerEmailTemplate(creatorEmail),
    });

    // STEP 6: Notify all users except buyers
    const users = await UserModel.find({ role: { $ne: 'buyer' } }, 'email firstName');

    const broadcast = `
      <h4>New Education Available</h4>
      <ul>
        <li><strong>Posted by:</strong> ${education.user.firstName}</li>
        <li><strong>Title:</strong> ${education.title}</li>
        <li><strong>Date:</strong> ${new Date().toDateString()}</li>
        <li><strong>Fee:</strong> ${education.fee ? `GHS ${education.fee}` : 'Free'}</li>
      </ul>
      <p>View it here:</p>
      <a href="${process.env.CLIENT_URL}/education/${education._id}" target="_blank">
        ${process.env.CLIENT_URL}/education/${education._id}
      </a>
    `;

    for (const user of users) {
      await mailTransporter.sendMail({
        from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `New Education: ${education.title}`,
        replyTo: 'info@castorcareghana.com',
        html: registerEmailTemplate(`<p>Hi ${user.firstName},</p>${broadcast}`),
      });
    }

    // Final response
    res.status(201).json({
      message: 'Education posted successfully!',
      education,
    });
  } catch (error) {
    console.error('❌ Error in addEducation:', error);
    next(error);
  }
};




export const getEducations = async (req, res, next) => {
  try {
    const { filter = "{}", sort = "{}", limit = 1000, skip = 0 } = req.query;

    const educations = await EducationModel
      .find(JSON.parse(filter))
      .sort(JSON.parse(sort))
      .limit(limit)
      .skip(skip)
      .populate("user");

    res.status(200).json(educations);
  } catch (error) {
    next(error);
  }
};

export const getEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const education = await EducationModel.findById(id).populate("user");
    if (!education) {
      return res.status(404).json("Education not found");
    }
    res.status(200).json(education);
  } catch (error) {
    next(error);
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    // Parse old media sent from the frontend
    const oldMedia = req.body.existingMedia ? JSON.parse(req.body.existingMedia) : [];

    // Parse new uploaded media files
    const newMedia = req.files?.map(file => {
      let type = 'document';
      if (file.mimetype.startsWith('image/')) type = 'image';
      else if (file.mimetype.startsWith('video/')) type = 'video';
      else if (file.mimetype.startsWith('audio/')) type = 'audio';

      return {
        type,
        filename: file.originalname || file.filename,
        fileUrl: file.secure_url || file.path || file.url,
      };
    }) || [];

    // Combine old and new media
    const mergedMedia = [...oldMedia, ...newMedia];

    // Validate the updated data
    const { error, value } = updateEducationValidator.validate({
      ...req.body,
      media: mergedMedia.length ? mergedMedia : undefined,
    });

    if (error) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details,
      });
    }

    // Find and update the education post
    const updatedEducation = await EducationModel.findOneAndUpdate(
      { _id: req.params.id, user: req.auth.id },
      value,
      { new: true }
    ).populate("user");

    if (!updatedEducation) {
      return res.status(404).json({ message: "Education not found" });
    }

    // ✅ Send confirmation email to the creator
    const emailContent = `
      <p>Hi ${updatedEducation.user.firstName},</p>
      <h4>Education updated successfully on ${new Date().toDateString()}.</h4>
      <ul>
        <li>Title: ${updatedEducation.title}</li>
        <li>Fee: GHC ${updatedEducation.fee}</li>
      </ul>
      <p>Click on the link below to view your education:</p>
      <a style="font-size: 14px; line-height: 1;" target="_blank" href="${process.env.CLIENT_URL}/education/${updatedEducation._id}">
        ${process.env.CLIENT_URL}/education/${updatedEducation._id}
      </a>
    `;

    await mailTransporter.sendMail({
      from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
      to: updatedEducation.user.email,
      subject: "Education Update",
      replyTo: 'info@castorcareghana.com',
      html: registerEmailTemplate(emailContent)
    });

    // ✅ Notify all non-buyer users
    const users = await UserModel.find({ role: { $ne: 'buyer' } }, 'email firstName');

    const educationBody = `
      <h4>Education Resource Updated</h4>
      <ul>
        <li>Posted by: ${updatedEducation.user.firstName || 'Unknown'}</li>
        <li>Date: ${new Date().toDateString()}</li>
        <li>Title: ${updatedEducation.title}</li>
        <li>Fee: GHC ${updatedEducation.fee || 'Free'}</li>
      </ul>
      <p>Click on the link below to view the updated education resource:</p> 
      <a style="font-size: 14px; line-height: 1;" href="${process.env.CLIENT_URL}/education/${updatedEducation._id}" target="_blank">
        ${process.env.CLIENT_URL}/education/${updatedEducation._id}
      </a> 
    `;

    for (const user of users) {
      await mailTransporter.sendMail({
        from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Updated Education: ${updatedEducation.title}`,
        replyTo: 'info@castorcareghana.com',
        html: registerEmailTemplate(`
          <p>Hi ${user.firstName || 'there'},</p>
          ${educationBody}
        `),
      });
    }

    // ✅ Send response
    res.status(200).json({
      message: "Education updated successfully!",
      updatedEducation,
    });

  } catch (error) {
    next(error);
  }
};


export const deleteEducation = async (req, res, next) => {
  try {
    const deletedEducation = await EducationModel.findOneAndDelete({
      _id: req.params.id,
      user: req.auth.id,
    }).populate("user");

    if (!deletedEducation) {
      return res.status(404).json("Education not found");
    }

    res.status(200).json({
      message: "Education deleted successfully!", deletedEducation,
    });
  } catch (error) {
    next(error);
  }
};
