import { isEmptyObject, guid } from "./utils";

export function FHIRSurvey(s: any) {
   const {
      locked,
      archived,
      informedConsent,
      id,
      shortDescription,
      dateCreated,
      description,
      open,
      name,
   } = s;
   return {
      fullUrl: `Survey/${guid()}`,
      resource: {
         resourceType: "Questionnaire",
         meta: {
            profile: [
               "http://ibm.com/fhir/fda/shape/StructureDefinition/ibm-fda-shape-survey",
            ],
         },
         extension: [
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-lockedQuestionnaire",
               valueBoolean: !isEmptyObject(locked) ? locked : false, //${locked}
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-archivedQuestionnaire",
               valueBoolean: archived, //${archived}
            },
            {
               url: "http://ibm.com/fhir/fda/shape/StructureDefinition/extension-informedConsentText",
               valueMarkdown: informedConsent, //"${informedConsent}"
            },
         ],
         identifier: [
            {
               system: "http://ibm.com/fhir/fda/SHAPE/identifier",
               value: id, //"${surveyid}"
            },
         ],
         title: shortDescription, //"${shortDescription}",
         date: dateCreated, //"${dateCreated}",
         description: description, //"${description}",
         name: name, //"${name}",
         status: open ? "active" : "retired", //"${open} ? active : retired"
      },
   };
}
