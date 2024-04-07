import nodemailer, { Transporter } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

import { configs } from "../configs/config";
import { emailTemplates } from "../constants/email.constant";
import { EEmailAction } from "../enums/email-action.enum";

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      from: "No reply",
      auth: {
        user: configs.SMTP_USER,
        pass: configs.SMTP_PASSWORD,
      },
    });

    const hbsOptions = {
      viewEngine: {
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: path.join(process.cwd(), "src", "templates", "layouts"),
        partialsDir: path.join(process.cwd(), "src", "templates", "partials"),
      },
      viewPath: path.join(process.cwd(), "src", "templates", "views"),
      extName: ".hbs",
    };

    this.transporter.use("compile", hbs(hbsOptions));
  }

  public async sendMail(
    email: string | string[],
    emailAction: EEmailAction,
    context: Record<string, string | number> = {},
  ) {
    const { subject, templateName } = emailTemplates[emailAction];

    context.frontUrl = configs.FRONT_URL;
    const mailOptions = {
      to: email,
      subject,
      template: templateName,
      context,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
