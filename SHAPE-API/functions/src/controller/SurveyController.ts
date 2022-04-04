import { Request, Response } from "express";
import {
   databaseError,
   insufficientParameters,
   successResponse,
} from "../common/utils";
import { SurveyService } from "../service";
import { surveyFactory } from "../factory/SurveyFactory";

export class SurveyController {
   private surveyService = new SurveyService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const survey = surveyFactory(org, req);
      if (survey) {
         this.surveyService.create(survey, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("create survey successful", data, res);
            }
         });
      } else {
         insufficientParameters(res);
      }
   }

   public getAll(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const participantId = req.query.participantId;
      if (participantId) {
         this.surveyService.query(
            participantId,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query surveys by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         this.surveyService.getAll(org, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("get all surveys successful", data, res);
            }
         });
      }
   }

   public query(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const query = req.body.query;
      if (query) {
         this.surveyService.complexQuery(
            query,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("query survey successful", data, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }

   public get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { surveyId: req.params.id };
         this.surveyService.filter(params, org, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("get survey successful", data, res);
            }
         });
      } else {
         insufficientParameters(res);
      }
   }
   

   public update(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const survey = {
            id: req.params.id,
            survey: req.body,
         };

         this.surveyService.update(
            survey,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "update Survey successful",
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

   public delete(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         this.surveyService.delete(
            req.params.id,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else if (data.deletedCount !== 0) {
                  successResponse("delete survey successful", null, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }
}
