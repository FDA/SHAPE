import {Application, Request, Response, Router} from "express";
import { createInboxValidation, updateInboxValidation, validate } from "../common/validation";
import {InboxController} from "../controller";

const router = Router();

export class InboxRoutes {

    private inboxController: InboxController = new InboxController();

    public createRoutes(app: Application) {

        // can accept participantId as query param ex. ?participantId=1111
        router.get("/inbox/", (req: Request, res: Response) => {
            this.inboxController.getAll(req, res);
        });

        // :id is the participant ID as well as the document ID
        router.get("/inbox/:id", (req: Request, res: Response) => {
            this.inboxController.get(req, res);
        });

        // includes middlewares for validating inbox fields
        router.post("/inbox", createInboxValidation(), validate, (req: Request, res: Response) => {
            this.inboxController.create(req, res);
        });

        // :id is the participant ID as well as the document ID
        router.put("/inbox/:id", updateInboxValidation(), validate, (req: Request, res: Response) => {
            this.inboxController.update(req, res);
        });

        // :id is the participant ID as well as the document ID
        router.delete("/inbox/:id", (req: Request, res: Response) => {
            this.inboxController.delete(req, res);

        });
        app.use(router);
    }
}
