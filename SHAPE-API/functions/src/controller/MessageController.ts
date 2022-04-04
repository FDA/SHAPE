import { Request, Response } from "express";
import {
   databaseError,
   successResponse,
   notAllowed,
   insufficientParameters,
} from "../common/utils";
import { MessageService } from "../service";
import { messageFactory } from "../factory/MessageFactory";

export class MessageController {
   private messageService = new MessageService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const message = messageFactory(org, req);
      if (message) {
         this.messageService.create(message, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("create message successful", data, res);
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
         this.messageService.query(
            org,
            participantId,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query messages by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         this.messageService.getAll(org, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("get all messages successful", data, res);
            }
         });
      }
   }

   public get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { messageId: req.params.id };
         this.messageService.filter(
            org,
            params,
            (error: boolean, data: any) => {
               if (error) {
                  databaseError(data, res);
               } else {
                  successResponse("get message successful", data, res);
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
