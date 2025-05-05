/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
  _id: Types.ObjectId;
  recommendedBy: Types.ObjectId;
  name: string;
  id: string;
  email: string;
  password: string;
  country: string;
  city: string;
  age: string;
  gender: string;
  passwordChangedAt?: Date;
  role: 'investor' | 'admin';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
  profileImg: string;

}

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByObjectId(_id: string): Promise<TUser | null>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
