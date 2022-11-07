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
import { FHIRPatient } from "./fhirPatientElements";
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
   const patients:any = [];
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
            break;
      }
   }

   wrapper.entry.push(FHIRQuestionnaire(formattedQuestions, questionnaire));

   for (const response of allResponses) {
      let subject;
      const patientsFiltered = patients.filter((elem:any) => elem.resource.identifier.value === response.profileId);
      if(patientsFiltered.length === 0) {
         subject = FHIRPatient(response.profileId, response.profile, response.profileDOB);
         patients.push(subject);
      } else {
         subject = patientsFiltered[0]
      }
      const answers = response.responses;
      const formattedAnswers: any = [];

      for (const answer of answers) {
         formattedAnswers.push(FHIRAnswer(answer));
      }
      wrapper.entry.push(FHIRResponse(formattedAnswers, response, subject.fullUrl));
   }

   wrapper.entry = wrapper.entry.concat(patients)

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
