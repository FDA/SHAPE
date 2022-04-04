import {Application, Request, Response, Router} from "express";
import { createMessageValidation, validate } from "../common/validation";
import {MessageController} from "../controller";

const router = Router();

export class MessageRoutes {

    private messageController: MessageController = new MessageController();

    public createRoutes(app: Application) {

        // can accept participantId as query param ex. ?participantId=1111
        router.get("/message", (req: Request, res: Response) => {
            this.messageController.getAll(req, res);
        });

        // where :id is the document ID
        router.get("/message/:id", (req: Request, res: Response) => {
            this.messageController.get(req, res);
        });

        // includes middlewares for validating message fields
        router.post("/message", createMessageValidation(), validate, (req: Request, res: Response) => {
            this.messageController.create(req, res);
        });

        //not allowed
        router.put("/message", (req: Request, res: Response) => {
            this.messageController.update(req, res);
        });

        // not allowed
        router.put("/message/:id", (req: Request, res: Response) => {
            this.messageController.update(req, res);
        });

        //not allowed
        router.delete("/message", (req: Request, res: Response) => {
            this.messageController.delete(req, res);
        });

        // not allowed
        router.delete("/message/:id", (req: Request, res: Response) => {
            this.messageController.delete(req, res);
        });
        
        app.use(router);
    }
}
