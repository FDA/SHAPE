import {Application, Request, Response, Router} from "express";
import { createParticipantDiaryValidation, updateParticipantDiaryValidation, validate } from "../common/validation";
import {ParticipantDiaryController} from "../controller/ParticipantDiaryController";

const router = Router();

export class ParticipantDiaryRoutes {

    private participantDiaryController = new ParticipantDiaryController();

    public createRoutes(app: Application) {

        // can accept participantId as query param ex. ?participantId=1111
        router.get("/participant-diary/", (req: Request, res: Response) => {
            this.participantDiaryController.getAll(req, res);
        });

        // where :id is the document ID
        router.get("/participant-diary/:id", (req: Request, res: Response) => {
            this.participantDiaryController.get(req, res);
        });

        // includes middlewares for validating participant diary fields
        router.post("/participant-diary", createParticipantDiaryValidation(), validate, (req: Request, res: Response) => {
            this.participantDiaryController.create(req, res);
        });

        router.post("/participant-diary/query", (req: Request, res: Response) => {
            this.participantDiaryController.query(req, res);
        });

        // where :id is the document ID
        router.put("/participant-diary/:id", updateParticipantDiaryValidation(), validate, (req: Request, res: Response) => {
            this.participantDiaryController.update(req, res);
        });

        // where :id is the document ID
        router.delete("/participant-diary/:id", (req: Request, res: Response) => {
            this.participantDiaryController.delete(req, res);
        });
        app.use(router);
    }
}
