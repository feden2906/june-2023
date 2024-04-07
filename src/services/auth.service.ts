import { Types } from "mongoose";

import { IChangePassword } from "../controllers/auth.controller";
import { EEmailAction } from "../enums/email-action.enum";
import { ERole } from "../enums/role.enum";
import { EActionTokenType } from "../enums/token-type.enum";
import { ApiError } from "../errors/api.error";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { ILogin } from "../types/auth.type";
import { ITokenPayload, ITokensPair } from "../types/token.type";
import { IUser } from "../types/user.type";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
// import { prepareSmsService } from "./prepare-sms.service";
import { tokenService } from "./token.service";

class AuthService {
  public async signUpAdmin(dto: Partial<IUser>): Promise<IUser> {
    const userFromDb = await userRepository.getOneByParams({
      email: dto.email,
    });
    if (userFromDb) {
      throw new ApiError("User with provided email already exists", 400);
    }

    const hashedPassword = await passwordService.hash(dto.password);

    return await userRepository.create({
      ...dto,
      password: hashedPassword,
      role: ERole.ADMIN,
    });
  }

  public async signInAdmin(dto: ILogin): Promise<ITokensPair> {
    const user = await userRepository.getOneByParams({
      email: dto.email,
      role: ERole.ADMIN,
    });
    if (!user) {
      throw new ApiError("Not valid email or password", 401);
    }

    const isMatch = await passwordService.compare(dto.password, user.password);
    if (!isMatch) {
      throw new ApiError("Not valid email or password", 401);
    }

    const jwtTokens = tokenService.generateTokenPair(
      { userId: user._id, role: ERole.ADMIN },
      ERole.ADMIN,
    );
    await tokenRepository.create({ ...jwtTokens, _userId: user._id });

    return jwtTokens;
  }

  public async signUp(dto: Partial<IUser>): Promise<IUser> {
    const userFromDb = await userRepository.getOneByParams({
      email: dto.email,
    });
    if (userFromDb) {
      throw new ApiError("User with provided email already exists", 400);
    }

    const hashedPassword = await passwordService.hash(dto.password);
    const user = await userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const actionToken = tokenService.createActionToken(
      { userId: user._id, role: ERole.USER },
      EActionTokenType.ACTIVATE,
    );

    await Promise.all([
      tokenRepository.createActionToken({
        actionToken,
        _userId: user._id,
        tokenType: EActionTokenType.ACTIVATE,
      }),
      emailService.sendMail(dto.email, EEmailAction.WELCOME, {
        name: dto.name,
        actionToken,
      }),
      // prepareSmsService.register(dto.phone, { name: dto.name }),
    ]);

    return user;
  }

  public async signIn(dto: ILogin): Promise<ITokensPair> {
    const user = await userRepository.getOneByParamsWithPassword({
      email: dto.email,
    });
    if (!user) {
      throw new ApiError("Not valid email or password", 401);
    }

    const isMatch = await passwordService.compare(dto.password, user.password);
    if (!isMatch) {
      throw new ApiError("Not valid email or password", 401);
    }

    if (!user.isVerified) {
      throw new ApiError("Verify your account", 403);
    }
    const jwtTokens = tokenService.generateTokenPair(
      { userId: user._id, role: ERole.USER },
      ERole.USER,
    );
    await tokenRepository.create({ ...jwtTokens, _userId: user._id });

    return jwtTokens;
  }

  public async refresh(
    jwtPayload: ITokenPayload,
    refreshToken: string,
  ): Promise<ITokensPair> {
    const user = await userRepository.getById(jwtPayload.userId);
    await tokenRepository.deleteOneByParams({ refreshToken });

    const jwtTokens = tokenService.generateTokenPair(
      {
        userId: jwtPayload.userId,
        role: user.role,
      },
      user.role,
    );
    await tokenRepository.create({
      ...jwtTokens,
      _userId: new Types.ObjectId(jwtPayload.userId),
    });

    return jwtTokens;
  }

  public async forgotPassword(user: IUser) {
    const actionToken = tokenService.createActionToken(
      { userId: user._id, role: ERole.USER },
      EActionTokenType.FORGOT,
    );

    await Promise.all([
      tokenRepository.createActionToken({
        actionToken,
        _userId: user._id,
        tokenType: EActionTokenType.FORGOT,
      }),
      emailService.sendMail(user.email, EEmailAction.FORGOT_PASSWORD, {
        actionToken,
      }),
    ]);
  }

  public async setForgotPassword(password: string, actionToken: string) {
    const payload = tokenService.checkActionToken(
      actionToken,
      EActionTokenType.FORGOT,
    );
    const entity = await tokenRepository.getActionTokenByParams({
      actionToken,
    });
    if (!entity) {
      throw new ApiError("Not valid token", 400);
    }
    const newHashedPassword = await passwordService.hash(password);
    await Promise.all([
      userRepository.updateById(payload.userId, {
        password: newHashedPassword,
      }),
      tokenRepository.deleteActionTokenByParams({ actionToken }),
    ]);
  }

  public async verify(actionToken: string) {
    const payload = tokenService.checkActionToken(
      actionToken,
      EActionTokenType.ACTIVATE,
    );
    const entity = await tokenRepository.getActionTokenByParams({
      actionToken,
    });
    if (!entity) {
      throw new ApiError("Not valid token", 400);
    }

    await Promise.all([
      userRepository.updateById(payload.userId, {
        isVerified: true,
      }),
      tokenRepository.deleteActionTokenByParams({ actionToken }),
    ]);
  }

  public async changePassword(dto: IChangePassword, jwtPayload: ITokenPayload) {
    const user = await userRepository.getById(jwtPayload.userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const isMatch = await passwordService.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new ApiError("Old password is invalid", 400);
    }

    const hashedNewPassword = await passwordService.hash(dto.newPassword);

    await userRepository.updateById(user._id, { password: hashedNewPassword });
  }
}

export const authService = new AuthService();
