import { Request } from "express"
import { Question } from "../interfaces"

export const questionFactory = (org: string, req: Request): Question => {
      const type = req.body.type;

      const question: Question = {
         title: req.body.title,
         type: req.body.type,
         variable: req.body.variable,
         org: org,
      };

      if (type !== "info") {
         question.text = req.body.text;
         question.required = req.body.required;
         question.requiredMessage =
            req.body.requiredMessage !== undefined
               ? req.body.requiredMessage
               : "";
         question.rules = req.body.rules !== undefined ? req.body.rules : [];
      }

      if (type === "textarea" || type === "singletext") {
         question.placeholder =
            req.body.placeholder !== undefined ? req.body.placeholder : "";
      }

      if (
         type === "radiogroup" ||
         type === "checkboxgroup" ||
         type === "select" ||
         req.body.choices !== undefined
      ) {
         question.choices = req.body.choices;
      }

      if (type === "range") {
         question.max = req.body.max;
         question.min = req.body.min;
      }

      if (type === "slider") {
         question.options = req.body.options;
      }

      if (type === "datetime") {
         question.format = req.body.format;
      }

      if (type === "info") {
         question.sections = req.body.sections;
      }
   
      return question;
}