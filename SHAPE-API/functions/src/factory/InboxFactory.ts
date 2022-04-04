import { Request } from "express";
import { Inbox } from "../interfaces";

export const inboxFactory = (org: string, req: Request):Inbox => {
   return {
      messages: [],
      org: org,
      participantId: req.body.participantId,
   };
};
