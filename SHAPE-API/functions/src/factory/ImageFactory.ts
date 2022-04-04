import { Request } from "express";
import { Image } from "../interfaces";

export const imageFactory = (org: string, req: Request):Image => {
   return {
      data: req.body.data,
      fileName: req.body.fileName,
      org: org,
      id: req.body.id,
   };
};