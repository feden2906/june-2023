import { NextFunction, Request, Response } from "express";

import { authService } from "../services/auth.service";
import { ILogin } from "../types/auth.type";
import { ITokenPayload } from "../types/token.type";
import { IUser } from "../types/user.type";
import {UserPresenter} from "../presenters/user.presenter";

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

class AuthController {
  public async signUpAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as Partial<IUser>;
      const createdUser = await authService.signUpAdmin(body);

      return res.json({ data: createdUser });
    } catch (e) {
      next(e);
    }
  }

  public async signInAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as ILogin;
      const jwtTokens = await authService.signInAdmin(body);

      return res.json({ data: jwtTokens });
    } catch (e) {
      next(e);
    }
  }

  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as Partial<IUser>;
      const createdUser = await authService.signUp(body);

      return res.json({ data: UserPresenter.userToResponse(createdUser) });
    } catch (e) {
      next(e);
    }
  }

  public async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as ILogin;
      const jwtTokens = await authService.signIn(body);

      return res.json({ data: jwtTokens });
    } catch (e) {
      next(e);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const refreshToken = req.res.locals.refreshToken as string;

      const jwtTokens = await authService.refresh(jwtPayload, refreshToken);

      return res.json({ data: jwtTokens });
    } catch (e) {
      next(e);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.res.locals as IUser;

      await authService.forgotPassword(user);

      return res.json("OK");
    } catch (e) {
      next(e);
    }
  }

  public async setForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const token = req.params.token;
      const newPassword = req.body.newPassword;

      await authService.setForgotPassword(newPassword, token);

      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  public async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token;

      await authService.verify(token);

      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const body = req.body as IChangePassword;

      await authService.changePassword(body, jwtPayload);

      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
}

export const authController = new AuthController();
