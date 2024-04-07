// import { Twilio } from "twilio";
//
// import { configs } from "../configs/config";
//
// class SMSService {
//   constructor(
//     private readonly client = new Twilio(
//       configs.TWILIO_ACCOUNT_SID,
//       configs.TWILIO_AUTH_TOKEN,
//     ),
//   ) {}
//
//   public async sendSms(number: string, message: string): Promise<void> {
//     try {
//       await this.client.messages.create({
//         to: number,
//         body: message,
//         messagingServiceSid: configs.TWILIO_SERVICE_SID,
//       });
//     } catch (e) {
//       console.error(e.message);
//     }
//   }
// }
//
// export const smsService = new SMSService();
