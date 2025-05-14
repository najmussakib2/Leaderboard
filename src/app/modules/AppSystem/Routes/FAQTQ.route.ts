import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';
import { FAQTQControllers } from '../Controllers/FAQTQ.controller';

const router = express.Router();

router.post('/faq', auth(USER_ROLE.admin), FAQTQControllers.createFAQ);

router.post(
  '/report',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FAQTQControllers.reportProblem,
);

router.post('/taq', auth(USER_ROLE.admin), FAQTQControllers.createTAQ);

router.get('/report', auth(USER_ROLE.admin), FAQTQControllers.getReports);

router.get(
  '/taq',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FAQTQControllers.getTAQ,
);

router.get(
  '/faq',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FAQTQControllers.getFAQ,
);

router.patch(
  '/report/:id',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FAQTQControllers.updateReport,
);

router.patch('/faq/:id', auth(USER_ROLE.admin), FAQTQControllers.updateFAQ);

router.patch('/taq/:id', auth(USER_ROLE.admin), FAQTQControllers.updateTAQ);

router.delete('/taq/:id', auth(USER_ROLE.admin), FAQTQControllers.deleteTAQ);

router.delete(
  '/report/:id',
  auth(USER_ROLE.admin),
  FAQTQControllers.deleteReport,
);

router.delete('/faq/:id', auth(USER_ROLE.admin), FAQTQControllers.deleteFAQ);

export const FAQTQRoutes = router;
