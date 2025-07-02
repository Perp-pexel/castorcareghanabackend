import { EducationModel } from "../model/education.js";
import { educationValidator, updateEducationValidator } from "../validator/education.js";
import { mailTransporter } from "../utils/mail.js";
import { registerEmailTemplate } from "../utils/emailTemplate.js";
import { UserModel } from "../model/user.js";


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

     const education = await EducationModel.findById(newEducation._id).populate("user");
    
            const emailContent = `
                            <p>Hi ${education.user.firstName}</p>
                                        <h4>Education added successfully on ${new Date().toDateString()}.</h4>
                                        <ul>
                                        <li>Title:  ${education.title}</li>
                                        <li>Fee:  GHC ${education.fee || 'Free'}</li>
                                        <li>Url:  ${education.url || 'N/A'}</li>
                                        </ul>
                                        <p>Click on the link below to view your education:</p>
                                        <a style="font-size: 14px; line-height: 1;"  target="_blank"; href="${process.env.CLIENT_URL}/education/${education._id}">${process.env.CLIENT_URL}/education/${education._id}</a>`
                            // Send professional a confirmation email
                            await mailTransporter.sendMail({
                                from: `Castor Care Ghana <${process.env.EMAIL_USER}`,
                                to: education.user.email,
                                subject: "Education Added",
                                replyTo: 'info@castorcareghana.com',
                                html: registerEmailTemplate(emailContent)
                            });

                            // Fetch all users except those with role 'buyer'
      const allUsers = await UserModel.find({ role: { $ne: 'buyer' } }, 'email firstName');

      // Email content template
      const emailBody = `
        <h4>New Education Posted.</h4>
        <ul>
          <li>Posted by: ${education.user.firstName || 'Unknown'}</li>
          <li>Date: ${new Date().toDateString()}</li>
          <li>Title: ${education.title}</li>
          <li>Fee: GHC ${education.fee || 'Free'}</li>
        </ul>
        
        <p>Click on the link below to view the education resource:</p>
          <a target="_blank" style="font-size: 14px; line-height: 1;" href="${process.env.CLIENT_URL}/education/${education._id}">
            ${process.env.CLIENT_URL}/education/${education._id}
          </a>
        
      `;

      // Broadcast to each user except buyers
      for (const user of allUsers) {
        await mailTransporter.sendMail({
          from: `Castor Care Ghana <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `New Education: ${education.title}`,
          replyTo: 'info@castorcareghana.com',
          html: registerEmailTemplate(`
            <p>Hi ${user.firstName || 'there'},</p>
            ${emailBody}
          `),
        });
      }


    res.status(201).json({
      message: "Education posted successfully!", education
    });
   } catch (error) {
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

    const updatedEducation = await EducationModel.findOneAndUpdate(
      { _id: req.params.id, user: req.auth.id },
      value,
      { new: true }
    ).populate("user");

    const emailContent = `
                            <p>Hi ${updatedEducation.user.firstName}<p>
                                        <h4>Education updated successfully on ${new Date().toDateString()}.</h4>
                                        <ul>
                                        <li>Title:  ${updatedEducation.title}</li>
                                        <li>Fee:  GHC ${updatedEducation.fee}</li>
                                        </ul>
                                        <p>Click on the link below to view your education:</p>
                                        <a style="font-size: 14px; line-height: 1;"  target="_blank"; href="${process.env.CLIENT_URL}/education/${updatedEducation._id}">${process.env.CLIENT_URL}/education/${updatedEducation._id}</a>`
                            // Send professional a confirmation email
                            await mailTransporter.sendMail({
                                from: `Castor Care Ghana <${process.env.EMAIL_USER}`,
                                to: updatedEducation.user.email,
                                subject: "Education Update",
                                replyTo: 'info@castorcareghana.com',
                                html: registerEmailTemplate(emailContent)
                            });
                            // Fetch users except buyers
  const users = await UserModel.find({ role: { $ne: 'buyer' } }, 'email firstName');

  
  // Send email to each user
  const educationBody = `
    <h4>Education Resource Updated.</h4>
    <ul>
      <li>Posted by: ${updatedEducation.user.firstName || 'Unknown'}</li>
      <li>Date: ${new Date().toDateString()}</li>
      <li>Title: ${updatedEducation.title}</li>
      <li>Fee: GHC ${updatedEducation.fee || 'Free'}</li>
    </ul>
    <p>Click on the link below to view the updated education resource:  </p> 
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


    if (!updatedEducation) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.status(200).json({
      message: "Education updated successfully!", updatedEducation,
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
