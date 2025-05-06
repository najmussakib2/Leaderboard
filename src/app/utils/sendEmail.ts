import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host || 'smtp.gmail.com',
    port: config.email.port || 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: config.email.user || 'nnsnajmussakib@gmail.com',
      pass: config.email.pass || 'fjgf dfbv mhlo hfad',
    },
  });

  await transporter.sendMail({
    from: config.email.from || 'nnsnajmussakib@gmail.com', // sender address
    to, // list of receivers
    subject: 'Reset your password within ten mins!', // Subject line
    text: '', // plain text body
    html, // html body
  });
};

