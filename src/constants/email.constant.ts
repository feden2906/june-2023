import { EEmailAction } from "../enums/email-action.enum";

export const emailTemplates = {
  [EEmailAction.WELCOME]: {
    templateName: "welcome",
    subject: "Happy to see you in our app !!!👋",
  },
  [EEmailAction.FORGOT_PASSWORD]: {
    templateName: "forgot-password",
    subject: "Restore password",
  },
  [EEmailAction.OLD_VISIT]: {
    templateName: "old-visit",
    subject: "Welcome again",
  },
};
