import { Request, Response } from "express";
import {
   databaseError,
   successResponse,
   notAllowed,
   insufficientParameters,
} from "../common/utils";
import { UserService } from "../service";
import { userFactory } from "../factory/UserFactory";

export class UserController {
   private userService = new UserService();

   /* Only to be used for testing with the emulator */
   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (process.env.FUNCTIONS_EMULATOR === "true") {
         if (req.body.participantId) {
            const user = userFactory(org, req);
            this.userService.create(user, (err: boolean, data: any) => {
               if (err) {
                  databaseError(data, res);
               } else {
                  successResponse("create user successful", data, res);
               }
            });
         } else {
            insufficientParameters(res);
         }
      } else {
         notAllowed("Method not permitted by this API.", res);
      }
   }

   public getAll(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const participantId = req.query.participantId;
      if (participantId) {
         this.userService.query(
            org,
            participantId,
            (err: boolean, data: any) => {
               if (err) {
                  databaseError(data, res);
               } else {
                  successResponse(
                     "query users by participantId successful",
                     data,
                     res
                  );
               }
            }
         );
      } else {
         this.userService.getAll(org, (err: boolean, data: any) => {
            if (err) {
               databaseError(data, res);
            } else {
               successResponse("get all users successful", data, res);
            }
         });
      }
   }

   public query(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const query = req.body.query;
      if (query) {
         this.userService.complexQuery(
            org,
            query,
            (err: boolean, data: any) => {
               if (err) {
                  databaseError(data, res);
               } else {
                  successResponse("query user successful", data, res);
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
         const params = { userId: req.params.id };
         this.userService.filter(org, params, (err: boolean, data: any) => {
            if (err) {
               databaseError(data, res);
            } else {
               successResponse("get user successful", data, res);
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
         const user = {
            id: req.params.id,
            user: {
               active: req.body.active,
            },
         };
         this.userService.update(org, user, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("update user successful", data, res);
            }
         });
      } else {
         insufficientParameters(res);
      }
   }

   public delete(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }
}
