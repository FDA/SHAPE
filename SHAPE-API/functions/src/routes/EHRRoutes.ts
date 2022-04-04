import { Application, Request, Response, Router } from "express";
import { EHRController } from "../controller";

const router = Router();

export class EHRRoutes {
   private ehrController: EHRController = new EHRController();

   public createRoutes(app: Application) {
      // can accept a participant ID to search by ex. ?participantId=1234
      router.get("/ehr/", (req: Request, res: Response) => {
         this.ehrController.getAll(req, res);
      });

      router.get("/ehr/:respondentId/:participantName/:dob", (req: Request, res: Response) => {
         this.ehrController.get(req, res);
      });

      // accepts "path" value in req.body
      router.post("/ehr/get", (req: Request, res: Response) => {
         this.ehrController.findOne(req, res);
      });

      // :id is the document ID
      // not allowed
      router.put("/ehr/:id", (req: Request, res: Response) => {
         this.ehrController.update(req, res);
      });

      // :id is the document ID
      // not allowed
      router.delete("/ehr/:id", (req: Request, res: Response) => {
         this.ehrController.delete(req, res);
      });
      
      app.use(router);
   }
}
