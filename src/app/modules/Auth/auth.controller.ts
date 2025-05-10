import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in successfully!',
    data: {
      accessToken,
    },
  });
});

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthServices.registerUser(req.body);
  const { token } = result;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sended successfully!',
    data: {
      token,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;

  const result = await AuthServices.changePassword(req.user, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is updated successfully!',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await AuthServices.forgetPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sended successfully!',
    data: { token: result },
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong !');
  }
  const result = await AuthServices.resetPassword(req.body, token);
  const { refreshToken, accessToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reseted successfully!',
    data: {
      accessToken,
    },
  });
});

const compareOTP = catchAsync(async (req, res) => {
  const { otp, email } = req.body;
  const result = await AuthServices.compareOTP(otp, email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP Matched successfully!',
    data: result,
  });
});

const resendOTP = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await AuthServices.resendOTP(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP re-sended successfully!',
    data: result,
  });
});

const addFacebook = catchAsync(async (req, res) => {
  const result = await AuthServices.addFacebook(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Facebook link added successfully!',
    data: result,
  });
});

const addLinkedin = catchAsync(async (req, res) => {
  const result = await AuthServices.addLinkedin(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Linkedin link added successfully!',
    data: result,
  });
});

const addInstagram = catchAsync(async (req, res) => {
  const result = await AuthServices.addInstagram(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Instagram link added successfully!',
    data: result,
  });
});

const addTwitter = catchAsync(async (req, res) => {
  const result = await AuthServices.addTwitter(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Twitter link added successfully!',
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,

  compareOTP,
  resendOTP,
  addFacebook,
  addLinkedin,
  addInstagram,
  addTwitter,
};
