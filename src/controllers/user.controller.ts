import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { UserPresenter } from "../presenters/user.presenter";
import { userService } from "../services/user.service";
import { IQuery } from "../types/pagination.type";
import { ITokenPayload } from "../types/token.type";
import { IUser } from "../types/user.type";

class UserController {
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAll();

      return res.json({ data: users });
    } catch (e) {
      next(e);
    }
  }

  public async getAllPaginated(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const usersPaginated = await userService.getMany(req.query as IQuery);
      const presentedUsers = usersPaginated.data.map((user) =>
        UserPresenter.userToResponse(user),
      );

      return res.json({ ...usersPaginated, data: presentedUsers });
    } catch (e) {
      next(e);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const user = await userService.getById(id);

      res.json({ data: user });
    } catch (e) {
      next(e);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      const user = await userService.getMe(jwtPayload);

      res.json({ data: UserPresenter.userToResponse(user) });
    } catch (e) {
      next(e);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const body = req.body as Partial<IUser>;

      const user = await userService.updateMe(jwtPayload, body);

      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }

  public async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      await userService.deleteMe(jwtPayload);

      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  public async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      await userService.uploadAvatar(
        jwtPayload.userId,
        req.files.avatar as UploadedFile,
      );

      res.json("OK");
    } catch (e) {
      next(e);
    }
  }

  public async deleteAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      await userService.deleteAvatar(jwtPayload.userId);

      res.json("OK");
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
