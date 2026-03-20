import nodemailer from "nodemailer";
const transport = nodemailer.createTransport({
  host: "smtp.zeptomail.in",
  port: 587,
  auth: {
    user: "emailappsmtp.101bcf6e760506e8",
    pass: "qAmAzZgxEGtV",
  },
});

export { transport };
