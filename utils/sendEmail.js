import nodemailer from "nodemailer";
import "dotenv/config";

export const sendEmail = async (subject, email, text) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const messageContent = {
      from: '"Bootcamp Management System" <noreply@bootcamp.com.np>', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: text, // plain text body
    };
    let info = await transporter.sendMail(messageContent);
  } catch (error) {
    console.log(error.message);
  }
};
