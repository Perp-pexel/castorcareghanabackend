import { createTransport } from "nodemailer";

export const mailTransporter = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_USER
});

