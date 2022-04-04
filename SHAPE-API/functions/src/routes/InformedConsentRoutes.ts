import {Application, Request, Response, Router} from "express";
import { createInformedConsentValidation, validate } from "../common/validation";
import {InformedConsentController} from "../controller";

const router = Router();

export class InformedConsentRoutes {

    private informedConsentController = new InformedConsentController();

    public createRoutes(app: Application) {

        // can accept surveyId as query param ex. ?surveyId=1111
        router.get("/informed-consent/", (req: Request, res: Response) => {
            this.informedConsentController.getAll(req, res);
        });

        // where :id is the document ID
        router.get("/informed-consent/:id", (req: Request, res: Response) => {
            this.informedConsentController.get(req, res);
        });

        // includes middlewares for validating informed consent fields
        router.post("/informed-consent", createInformedConsentValidation(), validate, (req: Request, res: Response) => {
            this.informedConsentController.create(req, res);
        });

        // not allowed
        router.put("/informed-consent", (req: Request, res: Response) => {
            this.informedConsentController.update(req, res);
        });

        // not allowed
        router.put("/informed-consent/:id", (req: Request, res: Response) => {
            this.informedConsentController.update(req, res);
        });

        // not allowed
        router.delete("/informed-consent", (req: Request, res: Response) => {
            this.informedConsentController.delete(req, res);
        });

        // not allowed
        router.delete("/informed-consent/:id", (req: Request, res: Response) => {
            this.informedConsentController.delete(req, res);
        });

        app.use(router);
    }
}
