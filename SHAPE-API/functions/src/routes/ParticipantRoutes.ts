import {Application, Request, Response, Router} from "express";
import { createParticipantValidation, updateParticipantValidation, validate } from "../common/validation";
import {ParticipantController} from "../controller";

const router = Router();

export class ParticipantRoutes {

    private participantController: ParticipantController = new ParticipantController();

    public createRoutes(app: Application) {

        // can accept participantId as query param  ex. ?participantId=1111
        router.get("/participant", (req: Request, res: Response) => {
            this.participantController.getAll(req, res);
        });

        // where :id is both the participant ID and document ID
        router.get("/participant/:id", (req: Request, res: Response) => {
            this.participantController.get(req, res);
        });

        // includes middlewares for validating participant fields
        router.post("/participant", createParticipantValidation(), validate, (req: Request, res: Response) => {
            this.participantController.create(req, res);
        });

        // where :id is both the participant ID and document ID
        router.put("/participant/:id", updateParticipantValidation(), validate, (req: Request, res: Response) => {
            this.participantController.update(req, res);
        });

        // where :id is both the participant ID and document ID
        router.delete("/participant/:id", (req: Request, res: Response) => {
            this.participantController.delete(req, res);

        });
        app.use(router);
    }
}
