import { Request } from "express";
import { User } from "../interfaces";

export const userFactory = (org: string, req: Request): User => {
   return {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      participantId: req.body.participantId,
      active: false,
      org: org
  };
};
