import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { StripServices } from '../Services/stripe.service';
import { paymentSuccess } from '../Constants/app.constant';

const checkoutPayment = catchAsync(async (req, res) => {
  const { amount} = req.body;
  const result = await StripServices.checkoutPayment(
    req.user.userId,
    amount,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Submitted successfully!',
    data: result,
  });
});

const checkoutWinnerPayment = catchAsync(async (req, res) => {
  const { amount, userId } = req.body;
  const result = await StripServices.checkoutWinnerPayment(
    userId,
    amount,
  );
  res.send()
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Submitted successfully!',
    data: result,
  });
});

const onSucccess = catchAsync(async (req, res) => {
  await StripServices.onSucccess(req.query);
    return res.send(paymentSuccess)
});


export const StripController = {
  checkoutPayment,
  onSucccess,
  checkoutWinnerPayment
};
