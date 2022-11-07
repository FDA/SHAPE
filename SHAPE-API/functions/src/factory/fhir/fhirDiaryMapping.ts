import { FHIRSurvey } from "./fhirSurveyElements";
import { FHIRPatient } from "./fhirPatientElements";
import { isEmptyObject, guid } from "./utils";
import { format } from "date-fns";

export function diaryToFhir(responses: any, survey: any) {
   const wrapper: any = getBundleResource();
   wrapper.entry.push(FHIRSurvey(survey));
   const patients: any = [];

   for (const res in responses) {
      const response = responses[res];
      const type = response.formType;

      let subject;
      const patientsFiltered = patients.filter((elem: any) => elem.resource.identifier.value === response.profileId);
      if (patientsFiltered.length === 0) {
         subject = FHIRPatient(response.profileId, response.profileName, response.profileDOB);
         patients.push(subject);
         wrapper.entry.push(subject)
      } else {
         subject = patientsFiltered[0]
      }

      switch (type) {
         case "Clinical Visit":
            wrapper.entry.push(getClinicalVisitDiary(response, subject.fullUrl));
            break;
         case "Withdrawal":
            wrapper.entry.push(getWithdrawalDiary(response, subject.fullUrl));
            break;
         case "Health Event":
            wrapper.entry.push(getHealthEventDiary(response, subject.fullUrl));
            break;
      }
   }
   return wrapper;
}

function getClinicalVisitDiary(d: any, subject: string) {
   const diary = {
      fullUrl: `QuestionnaireResponse/${guid()}`,
      resource: {
         resourceType: "QuestionnaireResponse",
         subject: {
            reference: subject
         },
         meta: {
            profile: [
               "http://ibm.com/fhir/fda/shape/StructureDefinition/ClinicalVisitDiaryEntry",
            ],
         },
         status: "completed",
         extension: [
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentSurvey",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: d.surveyId,
               },
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentQuestionnaire",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: "ClinicalVisit",
               },
            },
         ],
         item: [
            {
               linkId: "visitReason",
               answer: [
                  {
                     valueString: d.visitReason.trim(),
                  },
               ],
            },
            {
               linkId: "eventDate",
               answer: [
                  {
                     valueDate: format(new Date(d.eventDate), "yyyy-MM-dd"),
                  },
               ],
            },
            {
               linkId: "prescription",
               answer: [
                  {
                     valueCoding: {
                        code: d.prescription.toString(),
                        system:
                           "http://ibm.com/fhir/fda/shape/CodeSystem/ClinicalVisitPrescriptionAnswer",
                     },
                  },
               ],
            },
            {
               linkId: "GMFCType",
               answer: [
                  {
                     valueCoding: {
                        code: d.GMFCType.toString(),
                        system:
                           "http://ibm.com/fhir/fda/shape/CodeSystem/ClinicalVisitGMFCTypeAnswer",
                     },
                  },
               ],
            },
            {
               linkId: "GMFCScore",
               answer: [
                  {
                     valueString: d.GMFCScore.trim(),
                  },
               ],
            },
         ],
         identifier: {
            system: "http://ibm.com/fhir/fda/SHAPE/identifier",
            value: d.id,
         },
         source: {
            identifier: {
               system: "http://ibm.com/fhir/fda/SHAPE/participantId",
               value: d.participantId,
            },
         },
         authored: d.dateWritten,
      },
   };

   const deviceAnswer: any = [];
   d.device.forEach((device: any) => {
      deviceAnswer.push({
         valueCoding: {
            code: device.toString(),
            system:
               "http://ibm.com/fhir/fda/shape/CodeSystem/ClinicalVisitDeviceAnswer",
         },
      });
   });

   diary.resource.item.push({
      linkId: "device",
      answer: deviceAnswer,
   });

   const assessorAnswer: any = [];
   if(typeof(d.assessers) === "object") {
      d.assessers.forEach((assesser: any) => {
         assessorAnswer.push({
            valueCoding: {
               code: assesser.toString(),
               system:
                  "http://ibm.com/fhir/fda/shape/CodeSystem/ClinicalVisitAssessersAnswer",
            },
         });
      });
   } else {
      assessorAnswer.push({
         valueCoding: {
            code: d.assessers.toString(),
            system:
               "http://ibm.com/fhir/fda/shape/CodeSystem/ClinicalVisitAssessersAnswer",
         },
      });
   }
   

   diary.resource.item.push({
      linkId: "assessers",
      answer: assessorAnswer,
   });

   if (!isEmptyObject(d.assessorText))
      diary.resource.item.push({
         linkId: "assesserText",
         answer: [
            {
               valueString: d.assesserText.trim(),
            },
         ],
      });

   return diary;
}

function getWithdrawalDiary(d: any, subject: string) {
   return {
      fullUrl: `QuestionnaireResponse/${guid()}`,
      resource: {
         resourceType: "QuestionnaireResponse",
         subject: {
            reference: subject
         },
         meta: {
            profile: [
               "http://ibm.com/fhir/fda/shape/StructureDefinition/WithdrawalDiaryEntry",
            ],
         },
         status: "completed",
         extension: [
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentSurvey",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: d.surveyId,
               },
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentQuestionnaire",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: "Withdrawal",
               },
            },
         ],
         item: [
            {
               linkId: "withdrawalReason",
               answer: [
                  {
                     valueString: d.withdrawalReason.trim(),
                  },
               ],
            },
            {
               linkId: "withdrawalDate",
               answer: [
                  {
                     valueDateTime: d.withdrawalDate,
                  },
               ],
            },
         ],
         identifier: {
            system: "http://ibm.com/fhir/fda/SHAPE/identifier",
            value: d.id,
         },
         source: {
            identifier: {
               system: "http://ibm.com/fhir/fda/SHAPE/participantId",
               value: d.participantId,
            },
         },
         authored: d.dateWritten,
      },
   };
}

function getHealthEventDiary(d: any, subject: string) {
   const diary = {
      fullUrl: `QuestionnaireResponse/${guid()}`,
      resource: {
         resourceType: "QuestionnaireResponse",
         subject: {
            reference: subject
         },
         meta: {
            profile: [
               "http://ibm.com/fhir/fda/shape/StructureDefinition/HealthEventDiaryEntry",
            ],
         },
         status: "completed",
         extension: [
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentSurvey",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: d.surveyId,
               },
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentQuestionnaire",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: "HealthEvent",
               },
            },
         ],
         item: [
            {
               linkId: "healthEvent",
               answer: [
                  {
                     valueCoding: {
                        code: d.healthEvent.toString(),
                        system:
                           "http://ibm.com/fhir/fda/shape/CodeSystem/HealthEventTypeAnswer",
                     },
                  },
               ],
            },
            {
               linkId: "onsetDate",
               answer: [
                  {
                     valueDate: format(new Date(d.onsetDate), "yyyy-MM-dd"),
                  },
               ],
            },
            {
               linkId: "outcome",
               answer: [
                  {
                     valueCoding: {
                        code: d.outcome.toString(),
                        system:
                           "http://ibm.com/fhir/fda/shape/CodeSystem/HealthEventOutcomeAnswer",
                     },
                  },
               ],
            },
            {
               linkId: "ongoingStatus",
               answer: [
                  {
                     valueCoding: {
                        code: d.ongoingStatus.toString(),
                        system:
                           "http://ibm.com/fhir/fda/shape/CodeSystem/HealthEventOngoingAnswer",
                     },
                  },
               ],
            },
            {
               linkId: "eventTreament",
               answer: [
                  {
                     valueCoding: {
                        code: d.eventTreatment.toString(),
                        system:
                           "http://ibm.com/fhir/fda/shape/CodeSystem/HealthEventTreatmentAnswer",
                     },
                  },
               ],
            },
            {
               linkId: "postEventTreatment",
               answer: [
                  {
                     valueCoding: {
                        code: d.postEventTreatment.toString(),
                        system:
                           "http://ibm.com/fhir/fda/shape/CodeSystem/HealthEventPostEventTreatmentAnswer",
                     },
                  },
               ],
            },
            {
               linkId: "descriptionData",
               answer: [
                  {
                     valueString: d.descriptionData.trim(),
                  },
               ],
            },
         ],
         identifier: {
            system: "http://ibm.com/fhir/fda/SHAPE/identifier",
            value: d.id,
         },
         source: {
            identifier: {
               system: "http://ibm.com/fhir/fda/SHAPE/participantId",
               value: d.participantId,
            },
         },
         authored: d.dateWritten,
      },
   };

   if (d.ongoingStatus === 1 && !isEmptyObject(d.endDate))
      diary.resource.item.push({
         linkId: "endDate",
         answer: [
            {
               valueDate: format(new Date(d.endDate), "yyyy-MM-dd"),
            },
         ],
      });
   if (d.outcomeSpecification === 7 && !isEmptyObject(d.outcomeSpecification))
      diary.resource.item.push({
         linkId: "outcomeSpecification",
         answer: [
            {
               valueString: d.outcomeSpecification.trim(),
            },
         ],
      });
   if (d.healthEvent === 10 && !isEmptyObject(d.healthEventSpecification))
      diary.resource.item.push({
         linkId: "healthEventSpecification",
         answer: [
            {
               valueString: d.healthEventSpecification.trim(),
            },
         ],
      });

   return diary;
}

export function getBundleResource() {
   return {
      resourceType: "Bundle",
      id: "SHAPESurveyBundle",
      type: "collection",
      entry: [],
   };
}
