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
  auth(USER_ROLE.admin),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.get(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  UserControllers.getMe,
);

router.get(
  '/',
  auth(USER_ROLE.admin),
  UserControllers.getAllUsers,
);

router.get(
  '/referance',
  auth(USER_ROLE.admin),
  UserControllers.getAllRefferdUsers,
);

//all active users route neaded

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  UserControllers.viewDetailes,
);

router.patch(
  '/update-profileImg',
  auth(),
  upload.single('file'),
  UserControllers.updateProfileImg,
);

router.patch(
  '/add-view',
  auth(),
  UserControllers.addView,
);

router.patch(
  '/withdraw/:id',
  auth(),
  UserControllers.withdrawMoney,
);

router.delete(
  '/:id',
auth(USER_ROLE.admin, USER_ROLE.investor),
  UserControllers.deleteUser,
);

router.patch(
  '/:id',
auth(USER_ROLE.admin, USER_ROLE.investor),
  UserControllers.updateUser,
);

export const UserRoutes = router;
