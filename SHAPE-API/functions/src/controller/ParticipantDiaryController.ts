import { Request, Response } from "express";
import {
   databaseError,
   insufficientParameters,
   successResponse,
} from "../common/utils";
import { ParticipantDiaryService } from "../service/ParticipantDiaryService";
import { participantDiaryFactory } from "../factory/ParticipantDiaryFactory";

export class ParticipantDiaryController {
   private participantDiaryService = new ParticipantDiaryService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const participantDiary = participantDiaryFactory(org, req);
      if (participantDiary) {
         this.participantDiaryService.create(
            participantDiary,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "create participant diary successful",
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

   public getAll(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const participantId = req.query.participantId;
      if (participantId) {
         this.participantDiaryService.query(
            org,
            participantId,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query participant diaries by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else
         this.participantDiaryService.getAll(
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get all participant diaries successful",
                     data,
                     res
                  );
               }
            }
         );
   }

   public get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { participantDiaryId: req.params.id };
         this.participantDiaryService.filter(
            org,
            params,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get participant diary successful",
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
         this.participantDiaryService.complexQuery(
            org,
            query,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query participant diary successful",
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
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const participantDiary = {
            id: req.params.id,
            participantDiary: req.body,
         };
         this.participantDiaryService.update(
            org,
            participantDiary,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "update participant diary successful",
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
         this.participantDiaryService.delete(
            org,
            req.params.id,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else if (data.deletedCount !== 0) {
                  successResponse("delete participant diary successful", data, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }
}
