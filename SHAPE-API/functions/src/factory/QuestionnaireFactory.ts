import { Request } from "express";
import { Questionnaire } from "../interfaces";

export const questionnaireFactory = (org: string, req: Request): Questionnaire => {
   const questionnaire: Questionnaire = {
      archived: req.body.archived,
      dateCreated: req.body.dateCreated,
      description: req.body.description,
      name: req.body.name,
      open: req.body.open,
      shortDescription: req.body.shortDescription,
      surveyId: req.body.surveyId,
      participants: req.body.participants !== undefined ? req.body.participants : [],
      questions: req.body.questions !== undefined ? req.body.questions : [],
      locked: req.body.locked !== undefined ? req.body.locked : false,
      org: org,
      public: req.body.public !== undefined ? req.body.public : false,
   };
   if (req.body.form) questionnaire.form = req.body.form;
   return questionnaire;
}