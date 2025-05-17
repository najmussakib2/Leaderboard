import Stripe from 'stripe';
import config from '../../../config';
import { User } from '../../User/user.model';
import AppError from '../../../errors/AppError';
import httpStatus from 'http-status';
import { investMoney, raisedMoney } from './invest.service';
import { paymentSuccessQuery } from '../Interfaces/schema.interface';

const stripe = new Stripe(config.stripe_secret_key as string);

const checkoutPayment = async (userId: string, amount: number) => {
  if (amount <= 0 || !Number.isFinite(amount)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid payment amount');
  }

  const user = await User.findById(userId).select(
    'stripeCustomerId email name',
  );
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
    });
    if (!customer) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create Stripe customer',
      );
    }
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Investment',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      amount,
      type: 'Investment',
    },
    customer: user.stripeCustomerId,
    success_url: `${config.base_url}/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: config.origin_link,
  });

  return session.url;
};

const checkoutWinnerPayment = async (userId: string, amount: number) => {
  if (!userId || !amount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'missing some data!');
  }
  const result = await raisedMoney(userId, amount);
  return result;
};

const onSucccess = async (query: paymentSuccessQuery) => {
  if (!query.session_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'query not found');
  }
  const session = await stripe.checkout.sessions.retrieve(query.session_id);
  const userId = session.metadata?.userId as string;
  const amount = Number(session.metadata?.amount);
  const result = investMoney(userId, amount);

  return result;
};

// const createStripeAccount = async (
//   user: any,
//   host: string,
//   protocol: string,
// ): Promise<any> => {
//   const existingAccount = await StripeAccount.findOne({
//     userId: user.userId,
//   }).select('user accountId isCompleted');
//   // console.log('existingAccount', existingAccount);

//   if (existingAccount) {
//     if (existingAccount.isCompleted) {
//       return {
//         success: false,
//         message: 'Account already exists',
//         data: existingAccount,
//       };
//     }

//     const onboardingLink = await stripe.accountLinks.create({
//       account: existingAccount.accountId,
//       refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${existingAccount.accountId}`,
//       return_url: `${protocol}://${host}/api/v1/payment/success-account/${existingAccount.accountId}`,
//       type: 'account_onboarding',
//     });
//     // console.log('onboardingLink-1', onboardingLink);

//     return {
//       success: true,
//       message: 'Please complete your account',
//       url: onboardingLink.url,
//     };
//   }

//   const account = await stripe.accounts.create({
//     type: 'express',
//     email: user.email,
//     country: 'US',
//     capabilities: {
//       card_payments: { requested: true },
//       transfers: { requested: true },
//     },
//   });
//   // console.log('stripe account', account);

//   await StripeAccount.create({ accountId: account.id, userId: user.userId });

//   const onboardingLink = await stripe.accountLinks.create({
//     account: account.id,
//     refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${account.id}`,
//     return_url: `${protocol}://${host}/api/v1/payment/success-account/${account.id}`,
//     type: 'account_onboarding',
//   });
//   // console.log('onboardingLink-2', onboardingLink);

//   return {
//     success: true,
//     message: 'Please complete your account',
//     url: onboardingLink.url,
//   };
// };

export const StripServices = {
  checkoutPayment,
  onSucccess,
  checkoutWinnerPayment,
};
