import { Response } from "express";

export enum response_status_codes {
  success = 200,
  bad_request = 400,
  internal_server_error = 500,
  not_allowed = 405,
  unprocessable_entity = 422,
}

export function successResponse(message: string, DATA: any, res: Response) {
  res.status(response_status_codes.success).json({
    STATUS: "SUCCESS",
    MESSAGE: message,
    DATA,
  });
}

export function failureResponse(message: string, DATA: any, res: Response) {
  res.status(response_status_codes.success).json({
    STATUS: "FAILURE",
    MESSAGE: message,
    DATA,
  });
}

export function insufficientParameters(res: Response) {
  res.status(response_status_codes.bad_request).json({
    STATUS: "FAILURE",
    MESSAGE: "Insufficient parameters",
    DATA: {},
  });
}

export function databaseError(DATA: any, res: Response) {
  res.status(response_status_codes.internal_server_error).json({
    STATUS: "FAILURE",
    MESSAGE: "Database error",
    DATA,
  });
}

export function invalidParameters(error: string, res: Response) {
   res.status(response_status_codes.unprocessable_entity).json({
      STATUS: "FAILURE",
      MESSAGE: "invalid Parameters",
      DATA: error,
    });
}

export function notAllowed(error: string, res: Response) {
  res.status(response_status_codes.not_allowed).json({
    STATUS: "FAILURE",
    MESSAGE: "Method Not Allowed",
    DATA: error,
  });
}

export const containsCorrectKey = (query: any, key: string) => {
   return query.filter((item: any) => {
      return item.key === key;
   }).length > 0;
};