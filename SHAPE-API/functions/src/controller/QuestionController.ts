import { Request, Response } from "express";
import {
   databaseError,
   insufficientParameters,
   successResponse,
} from "../common/utils";
import { QuestionService } from "../service";
import { questionFactory } from "../factory/QuestionFactory";

export class QuestionController {
   private questionService = new QuestionService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const question = questionFactory(org, req);
      if (question) {
         this.questionService.create(question, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("create question successful", data, res);
            }
         });
      } else {
         insufficientParameters(res);
      }
   }

   public getAll(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      this.questionService.getAll(org, (error: boolean, data: any) => {
         if (error) {
            databaseError(data, res);
         } else {
            successResponse("get all questions successful", data, res);
         }
      });
   }

   public get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { questionId: req.params.id };
         this.questionService.filter(
            org,
            params,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("get question successful", data, res);
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
         const question = {
            id: req.params.id,
            question: req.body,
         };
         this.questionService.update(
            org,
            question,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "update question successful",
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
         this.questionService.delete(
            org,
            req.params.id,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else if (data.deletedCount !== 0) {
                  successResponse("delete question successful", data, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }
}
