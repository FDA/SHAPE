/**
 *    Fhir functions for Diary
 */

import {
   FHIRQuestionnaire,
   FHIRSingleText,
   FHIRRadio,
   FHIRDateTime,
   FHIRCheckbox,
   FHIRDropdown,
   FHIRSlider,
   FHIRTextarea,
   FHIRRange,
   FHIRInfo,
} from "./fhirQuestionnaireElements";
import { FHIRSurvey } from "./fhirSurveyElements";
import { FHIRAnswer, FHIRResponse } from "./fhirResponseElements";

/**
 *    Fhir functions for Questionnaire
 */
export function responsesToFhir(
   allResponses: any,
   questionnaire: any,
   survey: any
) {
   const questions = questionnaire.questions;
   const wrapper: any = getBundleResource();
   wrapper.entry.push(FHIRSurvey(survey));

   const formattedQuestions: any = [];

   for (const question of questions) {
      const type = question.type;
      switch (type) {
         case "checkboxgroup":
            formattedQuestions.push(FHIRCheckbox(question));
            break;
         case "datetime":
            formattedQuestions.push(FHIRDateTime(question));
            break;
         case "select": //dropdown
            formattedQuestions.push(FHIRDropdown(question));
            break;
         case "radiogroup":
            formattedQuestions.push(FHIRRadio(question));
            break;
         case "range":
            formattedQuestions.push(FHIRRange(question));
            break;
         case "singletext":
            formattedQuestions.push(FHIRSingleText(question));
            break;
         case "slider":
            formattedQuestions.push(FHIRSlider(question));
            break;
         case "textarea":
            formattedQuestions.push(FHIRTextarea(question));
            break;
         case "info":
            formattedQuestions.push(FHIRInfo(question));
            break;
         default:
            formattedQuestions.push(question);
      }
   }

   wrapper.entry.push(FHIRQuestionnaire(formattedQuestions, questionnaire));

   for (const response of allResponses) {
      const answers = response.responses;
      const formattedAnswers: any = [];

      for (const answer of answers) {
         formattedAnswers.push(FHIRAnswer(answer));
      }

      wrapper.entry.push(FHIRResponse(formattedAnswers, response));
   }

   return wrapper;
}

export function getBundleResource() {
   return {
      resourceType: "Bundle",
      id: "SHAPESurveyBundle",
      type: "collection",
      entry: [],
   };
}
