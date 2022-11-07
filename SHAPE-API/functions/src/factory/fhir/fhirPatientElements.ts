import { guid } from './utils';
import { format } from 'date-fns';

export function FHIRPatient(profileId: string, firstName: string, dob: string) {
   const birthDate = new Date(dob);
   return {
      fullUrl: `Patient/${guid()}`,
      resource: {
         resourceType: "Patient",
         identifier: [
            {
               system: "http://ibm.com/fhir/fda/SHAPE/profileId",
               value: profileId,
            }
         ],
         name: [
            {
               "given": [firstName],
            }
         ],
         birthDate: format(birthDate, "yyyy-MM-dd")
      }
   }
}