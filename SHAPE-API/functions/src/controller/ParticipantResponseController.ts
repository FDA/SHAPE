import { Request, Response } from "express";
import {
   databaseError,
   insufficientParameters,
   successResponse,
} from "../common/utils";
import { ParticipantResponseService } from "../service";
import { participantResponseFactory } from "../factory/ParticipantResponseFactory";

export class ParticipantResponseController {
   private participantResponseService = new ParticipantResponseService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const participantResponse = participantResponseFactory(org, req);
      if (participantResponse) {
         this.participantResponseService.create(
            participantResponse,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "create participant response successful",
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
         this.participantResponseService.query(
            org,
            participantId,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query participant responses by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else
         this.participantResponseService.getAll(
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get all participant responses successful",
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
         const params = { participantResponseId: req.params.id };
         this.participantResponseService.filter(
            org,
            params,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get participant response successful",
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
         this.participantResponseService.complexQuery(
            org,
            query,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query participant responses successful",
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
         const participantResponse = {
            id: req.params.id,
            participantResponse: req.body,
         };
         this.participantResponseService.update(
            org,
            participantResponse,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "update participant response successful",
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
         this.participantResponseService.delete(
            org,
            req.params.id,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else if (data.deletedCount !== 0) {
                  successResponse("delete participant successful", data, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }
}
