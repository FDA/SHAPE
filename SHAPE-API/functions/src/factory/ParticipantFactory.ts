import { Request } from "express";
import { Participant } from "../interfaces";

export const participantFactory = (org: string, req: Request):Participant => {
   return {
      participantId: req.body.participantId,
      public: req.body.public,
      securityQuestions: req.body.securityQuestions,
      org: org,
      optedOut: req.body.optedOut ? req.body.optedOut : false,
   };
};
