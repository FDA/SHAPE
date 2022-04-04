import { Request, Response } from "express";
import {
   databaseError,
   successResponse,
   notAllowed,
   insufficientParameters,
} from "../common/utils";
import { ImageService } from "../service";
import { imageFactory } from "../factory/ImageFactory";

export class ImageController {
   private imageService = new ImageService();

   public create(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      const image = imageFactory(org, req);
      if (image) {
         this.imageService.create(org, image, (error: boolean, data: any) => {
            if (error) {
               console.error(data);
               databaseError(data, res);
            } else {
               successResponse("create image successful", data, res);
            }
         });
      } else {
         insufficientParameters(res);
      }
   }

   public getAll(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      this.imageService.getAll(org, (error: boolean, data: any) => {
         if (error) {
            databaseError(data, res);
         } else {
            successResponse("get all images successful", data, res);
         }
      });
   }

   public get(req: Request, res: Response) {
      // @ts-ignore
      const org = req.org;
      if (req.params.id) {
         const params = { imageId: req.params.id };
         this.imageService.filter(org, params, (error: boolean, data: any) => {
            if (error) {
               databaseError(data, res);
            } else {
               successResponse("get image successful", data, res);
            }
         });
      } else {
         insufficientParameters(res);
      }
   }

   public update(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   } 

   public delete(req: Request, res: Response) {
      notAllowed("Method not permitted by this API.", res);
   }
}
