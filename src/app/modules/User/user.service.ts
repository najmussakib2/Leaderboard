/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { createToken } from '../Auth/auth.utils';
import { TUser } from './user.interface';
import { User } from './user.model';
import { Express } from 'express';
import { JwtPayload } from 'jsonwebtoken';

const createUserIntoDB = async (
  file: any,
  password: string,
  payload: TUser,
) => {
  //if password is not given , use default password
  payload.password = password || (config.default_password as string);

  try {
    if (file) {
      const imageName = `${payload?.name}-${payload.email}`;
      const path = file?.path;

      //send image to cloudinary
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.profileImg = secure_url as string;
    }

    const user = await User.create(payload); // array

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
