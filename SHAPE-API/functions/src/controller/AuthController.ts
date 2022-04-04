import { Request, Response } from "express";
import { databaseError, successResponse, notAllowed } from "../common/utils";
import { AuthService } from "../service";

export class AuthController {
   private authService = new AuthService();

   public create(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }

   public getAll(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }

   public get(req: Request, res: Response) {
      const body = {
         username: req.body.username,
         password: req.body.password,
      };
      this.authService.get(body, (error: boolean, data: any) => {
         if (error) {
            console.error("err returned by authService");
            databaseError(data, res);
         } else {
            successResponse("get auth successful", data, res);
         }
      })
      .catch((err) => {
         console.log("err caught by authController");
         databaseError(err, res);
      });
   }
   public delete(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }

   public update(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }
}
