import { UploadedFile } from "express-fileupload";

import { ApiError } from "../errors/api.error";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { IQuery } from "../types/pagination.type";
import { ITokenPayload } from "../types/token.type";
import { IUser } from "../types/user.type";
import { EFileType, s3Service } from "./s3.service";

class UserService {
  public async getAll(): Promise<IUser[]> {
    return await userRepository.getAll();
  }

  public async getById(id: string): Promise<IUser> {
    const user = await userRepository.getById(id);
    if (!user) {
      throw new ApiError("User not found", 422);
    }
    return user;
  }

  public async getMe(jwtPayload: ITokenPayload): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);
    if (!user) {
      throw new ApiError("You cant get this user", 403);
    }
    return user;
  }

  public async updateMe(
    jwtPayload: ITokenPayload,
    body: Partial<IUser>,
  ): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);
    if (!user) {
      throw new ApiError("User not found", 403);
    }
    return await userRepository.updateById(jwtPayload.userId, body);
  }

  public async deleteMe(jwtPayload: ITokenPayload): Promise<void> {
    const user = await userRepository.getById(jwtPayload.userId);
    if (!user) {
      throw new ApiError("User not found", 403);
    }
    await Promise.all([
      userRepository.deleteById(jwtPayload.userId),
      tokenRepository.deleteManyByUserId(jwtPayload.userId),
    ]);
  }

  public async getMany(query: IQuery) {
    const queryString = JSON.stringify(query);
    const queryObject = JSON.parse(
      queryString.replace(/\b(gte|lte|gt|lt)\b/, (match) => `$${match}`),
    );

    const usersPaginated = await userRepository.getMany(queryObject);

    return usersPaginated;
  }

  public async uploadAvatar(userId: string, avatar: UploadedFile) {
    const user = await userRepository.getById(userId);

    if (user.avatar) {
      await s3Service.deleteFile(user.avatar);
    }

    const filePath = await s3Service.uploadFile(avatar, EFileType.User, userId);

    await userRepository.updateById(userId, { avatar: filePath });
  }

  public async deleteAvatar(userId: string) {
    const user = await userRepository.getById(userId);

    if (user.avatar) {
      await s3Service.deleteFile(user.avatar);
    }

    await userRepository.updateById(userId, { avatar: null });
  }
}

export const userService = new UserService();
