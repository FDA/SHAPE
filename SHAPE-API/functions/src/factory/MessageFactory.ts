import { Request } from "express";
import { Message } from "../interfaces";

export const messageFactory = (org: string, req: Request):Message => {
   return {
      emailRecipients:
         req.body.emailRecipients !== undefined ? req.body.emailRecipients : [],
      pushRecipients:
         req.body.pushRecipients !== undefined ? req.body.pushRecipients : [],
      smsRecipients:
         req.body.smsRecipients !== undefined ? req.body.smsRecipients : [],
      message: req.body.message,
      subject: req.body.subject,
      timestamp: req.body.timestamp,
      org: org,
   };
};
