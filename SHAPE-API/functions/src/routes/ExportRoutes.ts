import { Application, Request, Response, Router } from "express";
import { ExportController } from "../controller";

const router = Router();

export class ExportRoutes {
   private exportController: ExportController = new ExportController();

   public createRoutes(app: Application) {
      // not allowed
      router.get("/export", (req: Request, res: Response) => {
         this.exportController.getAll(req, res);
      });

      // not allowed
      router.post("/export", (req: Request, res: Response) => {
         this.exportController.create(req, res);
      });

      router.post("/export/diary", (req: Request, res: Response) => {
         this.exportController.exportDiary(req, res);
      });

      router.post("/export/questionnaire", (req: Request, res: Response) => {
         this.exportController.exportQuestionnaire(req, res);
      });

      router.post("/export/diary/fhir", (req: Request, res: Response) => {
         this.exportController.exportDiaryFhir(req, res);
      });

      router.post("/export/questionnaire/fhir", (req: Request, res: Response) => {
         this.exportController.exportQuestionnaireFhir(req, res);
      });

      // not allowed
      router.put("/export", (req: Request, res: Response) => {
         this.exportController.update(req, res);
      });

      // not allowed
      router.delete("/export", (req: Request, res: Response) => {
         this.exportController.delete(req, res);
      });
      
      app.use(router);
   }
}
