import { ESMSAction } from "../enums/sms-action.enum";

export const smsTemplates = {
  [ESMSAction.WELCOME]: (context: { name: string }) =>
    `Hey, ${context.name}! Happy to see you in our app !!!👋`,
};
