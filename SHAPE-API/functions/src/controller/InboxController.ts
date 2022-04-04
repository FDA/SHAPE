import { Request, Response } from "express";
import {
   databaseError,
   insufficientParameters,
   successResponse,
} from "../common/utils";
import { InboxService } from "../service";
import { inboxFactory } from "../factory/InboxFactory";

export class InboxController {
   private inboxService = new InboxService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const inbox = inboxFactory(org, req);
      if (inbox) {
         this.inboxService.create(inbox, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("create inbox successful", data, res);
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
         this.inboxService.query(
            org,
            participantId,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query inboxes by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         this.inboxService.getAll(org, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("get all inboxes successful", data, res);
            }
         });
      }
   }

   // get is by participant ID by default
   public get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { inboxId: req.params.id };
         this.inboxService.filter(org, params, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("get inbox successful", data, res);
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
         const inbox = {
            id: req.params.id,
            inbox: req.body,
         };
         this.inboxService.update(
            org,
            inbox,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("update inbox successful", data, res);
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
         this.inboxService.delete(
            org,
            req.params.id,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(error, res);
               } else if (data.deletedCount !== 0) {
                  successResponse("delete inbox successful", null, res);
               }
            }
         );
      } else {
         insufficientParameters(res);
      }
   }
}
