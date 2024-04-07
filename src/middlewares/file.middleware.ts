import { NextFunction, Request, Response } from "express";

import { avatarConfig } from "../configs/avatar.config";
import { ApiError } from "../errors/api.error";

class FileMiddleware {
  public async isAvatarValid(req: Request, res: Response, next: NextFunction) {
    try {
      if (Array.isArray(req.files.avatar)) {
        throw new ApiError("Avatar must not be an array", 400);
      }

      const { size, mimetype } = req.files.avatar;

      if (size > avatarConfig.MAX_SIZE) {
        throw new ApiError("Avatar is too big", 400);
      }

      if (!avatarConfig.MIMETYPES.includes(mimetype)) {
        throw new ApiError("Avatar has invalid mimetype", 400);
      }

      next();
    } catch (e) {
      next(e);
    }
  }
}

export const fileMiddleware = new FileMiddleware();
