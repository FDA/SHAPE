import { Application, Request, Response, Router } from "express";
import { ImageController } from "../controller";
import { createImageValidation, validate } from "../common/validation";

const router = Router();

export class ImageRoutes {

    private imageController: ImageController = new ImageController();

    public createRoutes(app: Application) {

        router.get("/image", (req: Request, res: Response) => {
            this.imageController.getAll(req, res);
        });

        // where :id is the document ID
        router.get("/image/:id", (req: Request, res: Response) => {
            this.imageController.get(req, res);
        });
        
        // includes middlewares for validating image fields
        router.post("/image", createImageValidation(), validate, (req: Request, res: Response) => {
            this.imageController.create(req, res);         
        });

        // where :id is the document ID
        // not allowed
        router.put("/image/:id", (req: Request, res: Response) => {
            this.imageController.update(req, res);
        });

        // not allowed
        router.delete("/image/:id", (req: Request, res: Response) => {
            this.imageController.delete(req, res);
        });

        app.use(router);
    }
}
