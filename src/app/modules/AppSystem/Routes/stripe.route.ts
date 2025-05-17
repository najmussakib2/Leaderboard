import express from 'express';
import { StripController } from '../Controllers/stripe.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';

const router = express.Router();

router.post(
  '/chekout',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  StripController.checkoutPayment,
);

router.post(
  '/chekout-winner',
  auth(USER_ROLE.admin),
  StripController.checkoutWinnerPayment,
);

router.get(
  '/success',
  StripController.onSucccess,
);

export const StripeRoutes = router;
