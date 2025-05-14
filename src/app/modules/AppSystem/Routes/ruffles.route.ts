import express from 'express';
import { TicketControllers } from '../Controllers/ruffles.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';

const router = express.Router();

router.post('/', auth(USER_ROLE.admin), TicketControllers.createRuffles);

router.delete('/:id', auth(USER_ROLE.admin), TicketControllers.deleteRuffles);

router.post(
  '/ticket',
  auth(USER_ROLE.investor, USER_ROLE.admin),
  TicketControllers.createTicket,
);

router.get(
  '/ticket',
  auth(USER_ROLE.investor, USER_ROLE.admin),
  TicketControllers.getTickets,
);

router.get(
  '/my-tickets',
  auth(USER_ROLE.investor, USER_ROLE.admin),
  TicketControllers.getMyTickets,
);

router.get(
  '/ticket/:id',
  auth(USER_ROLE.investor, USER_ROLE.admin),
  TicketControllers.getTicketDetailes,
);

router.get(
  '/ticket/topper',
  auth(USER_ROLE.admin),
  TicketControllers.getMaxTicketHolder,
);

router.post(
  '/raise-topper/:id',
  auth(USER_ROLE.admin),
  TicketControllers.raiseTopper,
);

export const RufflesRoutes = router;
