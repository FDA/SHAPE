import { Application, Request, Response, Router } from "express";
import { getAuthValidation, validate } from "../common/validation";
import { AuthController } from "../controller";

const router = Router();

export class AuthRoutes {
   private authController: AuthController = new AuthController();

   public createRoutes(app: Application) {
      // includes middlewares for validating auth request fields
      router.post("/auth", getAuthValidation(), validate, (req: Request, res: Response) => {
         this.authController.get(req, res);
      });

      //not allowed
      router.get("/auth", (req: Request, res: Response) => {
         this.authController.getAll(req, res);
      });

      //not allowed
      router.put("/auth", (req: Request, res: Response) => {
         this.authController.update(req, res);
      });

      //not allowed
      router.delete("/auth", (req: Request, res: Response) => {
         this.authController.delete(req, res);
      });

      app.use(router);
   }
}
