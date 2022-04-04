import { Request, Response } from "express";
import {
   databaseError,
   successResponse,
   notAllowed,
   insufficientParameters,
} from "../common/utils";
import { InformedConsentService } from "../service";
import { informedConsentFactory } from "../factory";

export class InformedConsentController {
   private informedConsentService = new InformedConsentService();

   create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const informedConsent = informedConsentFactory(org, req);
      if (informedConsent) {
         this.informedConsentService.create(
            informedConsent,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "create informed-consent successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }

   getAll(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const surveyId = req.query.surveyId;
      if (surveyId) {
         this.informedConsentService.query(
            org,
            surveyId,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query informed-consent by surveyId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else
         this.informedConsentService.getAll(
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get all informed-consent successful",
                     data,
                     res
                  );
               }
            }
         );
   }

   get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { informedConsentId: req.params.id };
         this.informedConsentService.filter(
            org,
            params,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get informed-consent successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }

   public update(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }

   public delete(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }
}
