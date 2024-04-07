import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { isObjectIdOrHexString } from "mongoose";

import { ApiError } from "../errors/api.error";

class CommonMiddleware {
  public isIdValid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      if (!isObjectIdOrHexString(id)) {
        throw new Error("wrong ID param");
      }

      next();
    } catch (e) {
      next(e);
    }
  }

  public isBodyValid(validator: ObjectSchema) {
    return function (req: Request, res: Response, next: NextFunction) {
      try {
        const { value, error } = validator.validate(req.body);
        if (error) {
          throw new ApiError(error.details[0].message, 400);
        }

        req.body = value;

        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const commonMiddleware = new CommonMiddleware();
