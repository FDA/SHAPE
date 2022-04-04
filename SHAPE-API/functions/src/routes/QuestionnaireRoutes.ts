import {Application, Request, Response, Router} from "express";
import { createQuestionniareValidation, updateQuestionnaireValidation, validate } from "../common/validation";
import {QuestionnaireController} from "../controller";

const router = Router();

export class QuestionnaireRoutes {

    private questionnaireController: QuestionnaireController = new QuestionnaireController();

    public createRoutes(app: Application) {

       // can accept participantId as query param  ex. ?participantId=1111
        router.get("/questionnaire/", (req: Request, res: Response) => {
            this.questionnaireController.getAll(req, res);
        });

        // where :id is the document ID
        router.get("/questionnaire/:id", (req: Request, res: Response) => {
            this.questionnaireController.get(req, res);
        });

         // includes middlewares for validating questionnaire fields
        router.post("/questionnaire", createQuestionniareValidation(), validate, (req: Request, res: Response) => {
            this.questionnaireController.create(req, res);
        });

        router.post("/questionnaire/query", (req: Request, res: Response) => {
            this.questionnaireController.query(req, res);
        });

        // where :id is the document ID
        router.put("/questionnaire/:id", updateQuestionnaireValidation(), validate, (req: Request, res: Response) => {
            this.questionnaireController.update(req, res);

        });

        // where :id is the document ID
        router.delete("/questionnaire/:id", (req: Request, res: Response) => {
            this.questionnaireController.delete(req, res);

        });
        app.use(router);
    }
}
