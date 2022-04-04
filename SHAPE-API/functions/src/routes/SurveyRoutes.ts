import {Application, Request, Response, Router} from "express";
import { createSurveyValidation, updateSurveyValidation, validate } from "../common/validation";
import {SurveyController} from "../controller";
//mport {validationResult } from "express-validator";

const router = Router();

export class SurveyRoutes {

    private surveyController: SurveyController = new SurveyController();

    public createRoutes(app: Application) {
        // can accept participantId as query param  ex. ?participantId=1111
        router.get("/survey/", (req: Request, res: Response) => {
            this.surveyController.getAll(req, res);
        });

        // where :id is a document ID
        router.get("/survey/:id", (req: Request, res: Response) => {
            this.surveyController.get(req, res);
        });

        // includes middlewares for validating survey fields
        router.post("/survey", createSurveyValidation(), validate, (req: Request, res: Response) => {
            this.surveyController.create(req, res);
        });

        router.post("/survey/query", (req: Request, res: Response) => {
            this.surveyController.query(req, res);
        });

        // where :id is a document ID
        router.put("/survey/:id", updateSurveyValidation(), validate, (req: Request, res: Response) => {
            this.surveyController.update(req, res);
        });

        // where :id is a document ID
        router.delete("/survey/:id", (req: Request, res: Response) => {
            this.surveyController.delete(req, res);

        });
        app.use(router);
    }
}
