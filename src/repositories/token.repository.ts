import { FilterQuery } from "mongoose";

import { ActionToken } from "../models/action.model";
import { Token } from "../models/token.model";
import { IActionToken, IToken } from "../types/token.type";

class TokenRepository {
  public async create(data: Partial<IToken>) {
    return await Token.create(data);
  }

  public async getOneBy(params: Partial<IToken>): Promise<IToken> {
    return await Token.findOne(params).populate("_userId");
  }

  public async deleteManyByUserId(userId: string): Promise<void> {
    await Token.deleteMany({ _userId: userId });
  }

  public async deleteOneByParams(params: FilterQuery<IToken>): Promise<void> {
    await Token.deleteOne(params);
  }

  public async deleteManyByParams(params: FilterQuery<IToken>): Promise<void> {
    await Token.deleteMany(params);
  }

  public async createActionToken(data: Partial<IActionToken>) {
    return await ActionToken.create(data);
  }

  public async getActionTokenByParams(params: Partial<IActionToken>) {
    return await ActionToken.findOne(params);
  }

  public async deleteActionTokenByParams(params: Partial<IActionToken>) {
    return await ActionToken.deleteOne(params);
  }
}

export const tokenRepository = new TokenRepository();
