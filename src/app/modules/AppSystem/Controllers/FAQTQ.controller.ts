import httpStatus from 'http-status';
import sendResponse from '../../../utils/sendResponse';
import catchAsync from '../../../utils/catchAsync';
import { FAQTQServices } from '../Services/FAQTQ.service';

const createFAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.createFAQ(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ Created successfully!',
    data: result,
  });
});

const createTAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.createTAQ(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Created successfully!',
    data: result,
  });
});

const reportProblem = catchAsync(async (req, res) => {
  const result = await FAQTQServices.reportProblem(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Problem reported successfully!',
    data: result,
  });
});

const getReports = catchAsync(async (req, res) => {
  const result = await FAQTQServices.getReports();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports Retrived Successfully!',
    data: result,
  });
});
const getTAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.getTAQ();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Retrived Successfully!',
    data: result,
  });
});

const getFAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.getFAQ();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ Retrived Successfully!',
    data: result,
  });
});

const updateReport = catchAsync(async (req, res) => {
  const result = await FAQTQServices.updateReport(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Updated Successfully!',
    data: result,
  });
});

const updateFAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.updateFAQ(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ Updated Successfully!',
    data: result,
  });
});

const updateTAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.updateTAQ(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Updated Successfully!',
    data: result,
  });
});

const deleteTAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.deleteTAQ(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Updated Successfully!',
    data: result,
  });
});

const deleteFAQ = catchAsync(async (req, res) => {
  const result = await FAQTQServices.deleteFAQ(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TAQ Updated Successfully!',
    data: result,
  });
});

const deleteReport = catchAsync(async (req, res) => {
  const result = await FAQTQServices.deleteReport(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Updated Successfully!',
    data: result,
  });
});

export const FAQTQControllers = {
  createFAQ,
  createTAQ,
  getTAQ,
  getFAQ,
  updateFAQ,
  updateTAQ,
  deleteTAQ,
  deleteFAQ,
  reportProblem,
  getReports,
  updateReport,
  deleteReport
};
