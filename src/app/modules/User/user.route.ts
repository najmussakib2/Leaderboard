/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.post('/create-user', UserControllers.createUser);

router.post(
  '/change-status/:id',
  auth(),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.get(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  UserControllers.getMe,
);

router.patch(
  '/update-profileImg',
  auth(),
  upload.single('file'),
  UserControllers.updateProfileImg,
);

export const UserRoutes = router;
