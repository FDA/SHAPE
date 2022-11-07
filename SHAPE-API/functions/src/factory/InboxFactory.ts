import { Request } from "express";
import { Inbox } from "../interfaces";

export const inboxFactory = (org: string, req: Request):Inbox => {
   return {
      userId: req.body.userId,
      message: req.body.message,
      read: req.body.read ? req.body.read : false,
      subject: req.body.subject,
      timestamp: req.body.timestamp,
      org: org,
      participantId: req.body.participantId,
   };
};
