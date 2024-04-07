import { FilterQuery } from "mongoose";

import { Token } from "../models/token.model";
import { User } from "../models/user.model";
import { IPaginationResponse, IQuery } from "../types/pagination.type";
import { IUser } from "../types/user.type";

class UserRepository {
  public async getAll(): Promise<IUser[]> {
    return await User.find({});
  }

  public async getById(id: string): Promise<IUser> {
    return await User.findOne({ _id: id });
  }

  public async getOneByParams(params: FilterQuery<IUser>): Promise<IUser> {
    return await User.findOne(params);
  }

  public async getOneByParamsWithPassword(
    params: FilterQuery<IUser>,
  ): Promise<IUser> {
    return await User.findOne(params).select("+password");
  }

  public async updateById(id: string, body: Partial<IUser>): Promise<IUser> {
    return await User.findByIdAndUpdate(id, body, { returnDocument: "after" });
  }

  public async create(body: Partial<IUser>): Promise<IUser> {
    return await User.create(body);
  }

  public async deleteById(id: string): Promise<void> {
    await User.deleteOne({ _id: id });
  }

  public async findWithoutActivityAfter(date: Date): Promise<IUser[]> {
    return await User.aggregate([
      {
        $lookup: {
          from: Token.collection.name,
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_userId", "$$userId"] } } },
            { $match: { createdAt: { $gt: date } } },
          ],
          as: "tokens",
        },
      },
      {
        $match: {
          tokens: { $size: 0 },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
        },
      },
    ]);
  }

  public async getMany(query: IQuery): Promise<IPaginationResponse<IUser>> {
    const {
      page = 1,
      limit = 10,
      sortedBy = "createdAt",
      ...searchObject
    } = query;

    const skip = +limit * (+page - 1);

    const users = await User.find(searchObject)
      .sort(sortedBy)
      .limit(limit)
      .skip(skip);

    const itemsFound = await User.countDocuments(searchObject);

    return {
      page: +page,
      limit: +limit,
      itemsFound,
      data: users,
    };
  }
}

export const userRepository = new UserRepository();
