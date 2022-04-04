import { Request, Response } from "express";
import {
   databaseError,
   insufficientParameters,
   successResponse,
} from "../common/utils";
import { ParticipantService } from "../service";
import { participantFactory } from "../factory/ParticipantFactory";

export class ParticipantController {
   private participantService = new ParticipantService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const participant = participantFactory(org, req);
      if (participant) {
         this.participantService.create(
            participant,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("create participant successful", data, res);
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
         this.participantService.query(
            participantId,
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query participants by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         this.participantService.getAll(
            org,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get all participants successful",
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
         const params = { participantId: req.params.id };
         this.participantService.filter(
            org,
            params,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "get participant successful",
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
         const participant = {
            docId: req.params.id,
            participant: req.body,
         };
         this.participantService.update(
            org,
            participant,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "update participant successful",
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
         this.participantService.delete(
            org,
            req.params.id,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(error, res);
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
