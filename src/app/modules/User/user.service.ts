/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { createToken } from '../Auth/auth.utils';
import { User } from './user.model';
import { Express } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cleanObject } from './user.utils';

const createUserIntoDB = async (token: string) => {
  const decoded = jwt.verify(
    token,
    config.create_user_token as string,
  ) as JwtPayload;

  const userData = cleanObject(decoded, ['iat', 'exp']);

  try {
    const user = await User.create(userData); // array

    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }

    const jwtPayload = {
      userId: user.id,
      role: user.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    return {
      accessToken,
      refreshToken,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

const getMe = async (userId: string) => {
  const result = await User.findOne({ _id: userId });
  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const updateProfileImgInDB = async (
  file: Express.Multer.File | undefined,
  user: JwtPayload,
) => {
  const { userId } = user;
  let profileImg;

  if (file) {
    const imageName = `${user.userId}_${file.originalname}`;
    const { path } = file;
    const { secure_url: secureUrl } = await sendImageToCloudinary(
      imageName,
      path,
    );
    profileImg = secureUrl;
  }
  const result = await User.updateOne(
    { id: userId },
    { profileImg },
    { new: true },
  );
  return result;
};

export const UserServices = {
  createUserIntoDB,
  getMe,
  changeStatus,
  updateProfileImgInDB,
};
