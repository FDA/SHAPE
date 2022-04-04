import {Application, Request, Response, Router} from "express";
import { createUserValidation, updateUserValidation, validate } from "../common/validation";
import {UserController} from "../controller";

const router = Router();

export class UserRoutes {

    private userController: UserController = new UserController();

    public createRoutes(app: Application) {
        // can accept participantId as query param ex. ?participantId=1111
        router.get("/user/", (req: Request, res: Response) => {
            this.userController.getAll(req, res);
        });

        // where :id is the documentId
        router.get("/user/:id", (req: Request, res: Response) => {
            this.userController.get(req, res);
        });

        router.post("/user", createUserValidation(), validate, (req: Request, res: Response) => {
            this.userController.create(req, res);
        });

        router.post("/user/query", (req: Request, res: Response) => {
            this.userController.query(req, res);
        });

         // where :id is the documentId
        router.put("/user/:id", updateUserValidation(), validate, (req: Request, res: Response) => {
            this.userController.update(req, res);
        });
        
        // not allowed
        router.delete("/user/", (req: Request, res: Response) => {
            this.userController.delete(req, res);
        });

        // not allowed
        router.delete("/user/:id", (req: Request, res: Response) => {
            this.userController.delete(req, res);
        });

        app.use(router);
    }
}
