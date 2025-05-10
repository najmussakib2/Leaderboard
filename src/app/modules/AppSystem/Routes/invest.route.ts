import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';
import { InvestControllers } from '../Controllers/invest.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.investor),
  // validateRequest(AuthValidation.loginValidationSchema),
  InvestControllers.investMoney,
);

export const InvestRoutes = router;