import { Request, Response } from "express";
import { databaseError, successResponse, notAllowed, containsCorrectKey, invalidParameters } from "../common/utils";
import { ExportService } from "../service";

export class ExportController {
   private exportService = new ExportService();

   public getAll(req: Request, res: Response) {
      notAllowed(
         "Method not permitted by this API. Query is recommended instead.",
         res
      );
   }

   public exportDiary(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const query = req.body.query;
      if (containsCorrectKey(query, "surveyId")) {
         this.exportService.exportDiary(
            query,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("JSON diary export successful", data, res);
               }
            }
         );
      } else {
         invalidParameters("invalid query", res);
      }
   }

   public exportDiaryFhir(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const query = req.body.query;
      if (containsCorrectKey(query, "surveyId")) {
         this.exportService.exportDiaryFhir(
            query,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("FHIR diary export successful", data, res);
               }
            }
         );
      } else {
         invalidParameters("invalid query", res);
      }
   }

   public exportQuestionnaire(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const query = req.body.query;
      if (containsCorrectKey(query, "questionnaireId")) {
         this.exportService.exportQuestionnaire(
            query,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "JSON questionnaire export successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         invalidParameters("invalid query", res);
      }
   }

   public exportQuestionnaireFhir(req: Request, res: Response) {    
      // @ts-ignore
      const org = req.org;
      const query = req.body.query;
      if (containsCorrectKey(query, "questionnaireId")) {
         this.exportService.exportQuestionnaireFhir(
            query,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "FHIR questionnaire export successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
          invalidParameters("invalid query", res);
      }
   }

   public create(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }

   public update(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }

   public delete(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }
}
