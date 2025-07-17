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
    // 1. Parse existingMedia from body (JSON string to array)
    const existingMediaRaw = req.body.existingMedia;
    const existingMedia = existingMediaRaw ? JSON.parse(existingMediaRaw) : [];

    // 2. Handle new uploaded files
    const uploadedFiles = req.files || [];
    const newMedia = uploadedFiles.map(file => {
      let type = 'document';
      if (file.mimetype.startsWith('image/')) type = 'image';
      else if (file.mimetype.startsWith('video/')) type = 'video';
      else if (file.mimetype.startsWith('audio/')) type = 'audio';

      return {
        type,
        filename: file.originalname || file.filename,
        fileUrl: file.secure_url || file.path || file.url,
      };
    });

    // 3. Combine all media
    const combinedMedia = [...existingMedia, ...newMedia];

    // 4. Validate the complete update payload
    const { error, value } = updateEducationValidator.validate({
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      fee: req.body.fee || '',
      media: combinedMedia,
    });

    if (error) {
      return res.status(422).json({
        message: 'Validation failed',
        details: error.details,
      });
    }

    // 5. Update the education post
    const updatedEducation = await EducationModel.findOneAndUpdate(
      { _id: req.params.id, user: req.auth.id },
      value,
      { new: true }
    ).populate('user');

    if (!updatedEducation) {
      return res.status(404).json({ message: 'Education not found' });
    }

    // 6. Send email to education owner
    const emailContent = `
      <p>Hi ${updatedEducation.user.firstName},</p>
      <h4>Your education resource was successfully updated.</h4>
      <ul>
        <li>Title: ${updatedEducation.title}</li>
        <li>Fee: GHC ${updatedEducation.fee}</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/education/${updatedEducation._id}" target="_blank">
        View Education
      </a>
    `;

    await mailTransporter.sendMail({
      from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
      to: updatedEducation.user.email,
      subject: 'Education Updated Successfully',
      html: registerEmailTemplate(emailContent),
      replyTo: 'info@castorcareghana.com',
    });

    // 7. Notify other users (optional bulk)
    const users = await UserModel.find({ role: { $ne: 'buyer' } });
    const notifyBody = `
      <h4>An education post has been updated</h4>
      <ul>
        <li>By: ${updatedEducation.user.firstName}</li>
        <li>Title: ${updatedEducation.title}</li>
        <li>Fee: GHC ${updatedEducation.fee || 'Free'}</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/education/${updatedEducation._id}" target="_blank">
        View Updated Education
      </a>
    `;

    for (const user of users) {
      await mailTransporter.sendMail({
        from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Updated Education: ${updatedEducation.title}`,
        html: registerEmailTemplate(`<p>Hi ${user.firstName || 'there'},</p>${notifyBody}`),
        replyTo: 'info@castorcareghana.com',
      });
    }

    // 8. Respond with updated education
    res.status(200).json({
      message: 'Education updated successfully!',
      updatedEducation,
    });

  } catch (err) {
    next(err);
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
