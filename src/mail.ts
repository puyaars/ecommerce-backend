import { Transporter } from "./../node_modules/@types/nodemailer/index.d";
import nodemailer from "nodemailer";

const Transporter = nodemailer.createTransport({
  service: "DebugMail",
  auth: {
    user: "894c2869-1bff-4c48-ae9e-3da827f24269",
    pass: "82d1b10f-8c5e-4a20-9c38-a3963cce3452",
  },
});

Transporter.sendMail(
  {
    from: "sender@server.com",
    to: "puyaars@gmail.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
    html: "<h1>That was easy!</h1>",
  },
  (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  }
);
