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
import { Investment } from '../AppSystem/Models/invest.model';
import { Raised } from '../AppSystem/Models/raised.model';
import { Rank } from '../AppSystem/Models/rank.model';

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
  // 1. Get user
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  // 2. Get investments
  const investments = await Investment.find(
    { user: userId },
    { amount: 1, createdAt: 1 },
  )
    .sort({ createdAt: -1 })
    .lean();
  const totalInvest = investments.reduce((sum, inv) => sum + inv.amount, 0);

  // 3. Get raised bonuses
  const raisedBonuses = await Raised.find(
    { user: userId },
    { amount: 1, createdAt: 1 },
  )
    .sort({ createdAt: -1 })
    .lean();
  const totalRaised = raisedBonuses.reduce((sum, r) => sum + r.amount, 0);

  // 4. Get rank
  const rank = await Rank.findOne({ user: userId }).lean();

  const rankInfo = rank
    ? {
        investRank: rank.rank,
        prevInvestRankHistory: rank.prevRank || [],
        raisedRank: rank.raisedRank,
        prevRaisedRankHistory: rank.prevRaisedRank || [],
      }
    : {
        investRank: null,
        prevInvestRankHistory: [],
        raisedRank: null,
        prevRaisedRankHistory: [],
      };

  return {
    user,
    investments,
    totalInvest,
    raisedBonuses,
    totalRaised,
    rankInfo,
  };
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const addView = async (_id: string) => {
  const result = await User.findByIdAndUpdate(_id, { $inc: { views: 1 } }, {
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
  addView
};
