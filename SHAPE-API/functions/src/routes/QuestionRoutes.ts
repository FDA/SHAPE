import {Application, Request, Response, Router} from "express";
import { createQuestionValidation, updateQuestionValidation, validate } from "../common/validation";
import {QuestionController} from "../controller";

const router = Router();

export class QuestionRoutes {

    private questionController: QuestionController = new QuestionController();

    public createRoutes(app: Application) {

        router.get("/question", (req: Request, res: Response) => {
            this.questionController.getAll(req, res);
        });

        // where :id is the document ID
        router.get("/question/:id", (req: Request, res: Response) => {
            this.questionController.get(req, res);
        });

        router.post("/question", createQuestionValidation(), validate, (req: Request, res: Response) => {
            this.questionController.create(req, res);
        });

        // where :id is the document ID
        router.put("/question/:id", updateQuestionValidation(), validate, (req: Request, res: Response) => {
            this.questionController.update(req, res);

        });

        router.delete("/question/:id", (req: Request, res: Response) => {
            this.questionController.delete(req, res);

        });
        app.use(router);
    }
}
