import { Document } from "mongoose";

import { ERole } from "../enums/role.enum";

export interface IUser extends Document {
  name: string;
  email: string;
  age: number;
  password: string;
  phone: string;
  isVerified: boolean;
  avatar: string;
  role: ERole;
  createdAt: Date;
}
