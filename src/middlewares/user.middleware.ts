import { NextFunction, Request, Response } from "express";

import { ERole } from "../enums/role.enum";
import { ApiError } from "../errors/api.error";
import { userRepository } from "../repositories/user.repository";
import { IUser } from "../types/user.type";

class UserMiddleware {
  public haveAccessByRole(...roles: ERole[]) {
    return function (req: Request, res: Response, next: NextFunction) {
      try {
        const payload = req.res.locals.jwtPayload;
        if (!roles.includes(payload?.role)) {
          throw new ApiError("Access denied", 403);
        }
        next();
      } catch (e) {
        next(e);
      }
    };
  }

  public isUserExist(field: keyof IUser) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await userRepository.getOneByParams({
          [field]: req.body[field],
        });

        if (!user) {
          throw new ApiError("User not found", 404);
        }

        req.res.locals = user;

        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const userMiddleware = new UserMiddleware();
