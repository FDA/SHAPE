import { Request } from "express";
import { InformedConsent } from "../interfaces";

export const informedConsentFactory = (org: string, req: Request):InformedConsent => {
   return {
      surveyId: req.body.surveyId,
      participantId: req.body.participantId,
      emailSent: req.body.emailSent,
      dateAgreed: req.body.dateAgreed,
      org: org,
   };
};
