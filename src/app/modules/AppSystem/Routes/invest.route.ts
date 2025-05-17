import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';
import { InvestControllers } from '../Controllers/invest.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.investor, USER_ROLE.admin),
  (req, res, next) => {
    console.log('from 11))>> ', req.user);
    next();
  },
  InvestControllers.investMoney,
);

router.get(
  '/revenue',
  auth(USER_ROLE.admin),
  InvestControllers.investRevenueByMonth,
);

export const InvestRoutes = router;
