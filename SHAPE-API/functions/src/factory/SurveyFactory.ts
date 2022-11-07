import { Request } from "express";
import { Survey } from "../interfaces";

export const surveyFactory = (org: string, req: Request): Survey => {
   return {
      archived: req.body.archived,
      dateCreated: req.body.dateCreated,
      description: req.body.description,
      informedConsent: req.body.informedConsent,
      name: req.body.name,
      open: req.body.open,
      shortDescription: req.body.shortDescription,
      participants: req.body.participants !== undefined ? req.body.participants : [],
      locked: req.body.locked !== undefined ? req.body.locked : false,
      org: org,
      public: req.body.public !== undefined ? req.body.public : false
  };
}