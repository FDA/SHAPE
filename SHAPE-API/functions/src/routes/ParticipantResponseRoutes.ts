import {Application, Request, Response, Router} from "express";
import { createParticipantResponseValidation, updateParticipantResponseValidation, validate } from "../common/validation";
import {ParticipantResponseController} from "../controller";

const router = Router();

export class ParticipantResponseRoutes {

    private participantResponseController = new ParticipantResponseController();

    public createRoutes(app: Application) {

        // can accept participantId as query param ex. ?participantId=1111
        router.get("/participant-response/", (req: Request, res: Response) => {
            this.participantResponseController.getAll(req, res);
        });

        // where :id is the document ID
        router.get("/participant-response/:id", (req: Request, res: Response) => {
            this.participantResponseController.get(req, res);
        });

        // includes middlewares for validating participant response fields
        router.post("/participant-response", createParticipantResponseValidation(), validate, (req: Request, res: Response) => {
            this.participantResponseController.create(req, res);
        });

        router.post("/participant-response/query", (req: Request, res: Response) => {
            this.participantResponseController.query(req, res);
        });

        // where :id is the document ID
        router.put("/participant-response/:id", updateParticipantResponseValidation(), validate, (req: Request, res: Response) => {
            this.participantResponseController.update(req, res);

        });

        // where :id is the document ID
        router.delete("/participant-response/:id", (req: Request, res: Response) => {
            this.participantResponseController.delete(req, res);
        });
        app.use(router);
    }
}
