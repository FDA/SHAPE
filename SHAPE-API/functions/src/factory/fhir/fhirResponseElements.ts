export function FHIRResponse(responses: any, response: any) {
   return {
      resource: {
         resourceType: "QuestionnaireResponse",
         meta: {
            profile: [
               "http://ibm.com/fhir/fda/shape/StructureDefinition/ibm-fda-shape-response",
            ],
         },
         extension: [
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentSurvey",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: response.surveyId, //"${surveyId}"
               },
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-parentQuestionnaire",
               valueIdentifier: {
                  system: "http://ibm.com/fhir/fda/SHAPE/identifier",
                  value: response.questionnaireId, //"${questionnaireId}"
               },
            },
         ],
         identifier: {
            system: "http://ibm.com/fhir/fda/SHAPE/identifier",
            value: response.id, //"${id}"
         },
         status: "completed",
         source: {
            identifier: {
               system: "http://ibm.com/fhir/fda/SHAPE/participantId",
               value: response.participantId, //"${participantId}"
            },
         },
         authored: response.dateWritten, //"${dateWritten}",
         item: responses,
      },
   };
}

export function FHIRAnswer(r: any) {
   const { question, response } = r;

   const formattedResponse: any = {
      linkId: question, //"${question}",
   };

   if (Array.isArray(response)) {
      const answers: any = [];
      for (const res of response) {
         answers.push({ valueString: res.toString().trim() });
      }
      formattedResponse.answer = answers;
   } else {
      formattedResponse.answer = [{ valueString: response.toString().trim() }];
   }

   return formattedResponse;
}
