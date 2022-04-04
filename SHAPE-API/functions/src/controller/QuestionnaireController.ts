import { Request, Response } from "express";
import {
   databaseError,
   insufficientParameters,
   successResponse,
} from "../common/utils";
import { QuestionnaireService } from "../service";
import { questionnaireFactory } from "../factory/QuestionnaireFactory";

export class QuestionnaireController {
   private questionnaireService = new QuestionnaireService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const questionnaire = questionnaireFactory(org, req);
      if (questionnaire) {
         this.questionnaireService.create(
            questionnaire,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("create questionnaire successful", data, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }

   public getAll(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const participantId = req.query.participantId;
      if (participantId) {
         this.questionnaireService.query(
            org,
            participantId,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query questionnaires by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         this.questionnaireService.getAll(
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get all questionnaires successful",
                     data,
                     res
                  );
               }
            }
         );
      }
   }

   public get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { questionnaireId: req.params.id };
         this.questionnaireService.filter(
            org,
            params,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get questionnaire successful",
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

   public query(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const query = req.body.query;
      if (query) {
         this.questionnaireService.complexQuery(
            org,
            query,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query questionnaire successful",
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
         this.questionnaireService.delete(
            org,
            req.params.id,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else if (data.deletedCount !== 0) {
                  successResponse("delete questionnaire successful", null, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }

   public update(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const questionnaire = {
            id: req.params.id,
            questionnaire: req.body,
         };

         this.questionnaireService.update(
            org,
            questionnaire,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "update questionnaire successful",
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
}
