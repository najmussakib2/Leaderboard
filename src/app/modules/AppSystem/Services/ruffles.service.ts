import AppError from '../../../errors/AppError';
import httpStatus from 'http-status';
import { Ticket } from '../Models/ticket.model';
import mongoose, { Types } from 'mongoose';
import { Raised } from '../Models/raised.model';
import { User } from '../../User/user.model';
import { Ruffles } from '../Models/ruffles.model';

const createRuffles = async (payload: {
  deadline: Date;
  prizeMoney: number;
  ticketButtons: number[];
}) => {
  if (!payload) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the number!');
  }
  const result = await Ruffles.create(payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to create!');
  }
  return result;
};

const createTicket = async (payload: { qty: number; user: string }) => {
  const ruffle = await Ruffles.find();
  if (!ruffle || ruffle.length < 1) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'There are no ongoing raffles at the moment!',
    );
  }
  const isExpired = new Date(ruffle[0].deadline) < new Date();
  if (isExpired) {
    throw new AppError(httpStatus.NOT_FOUND, 'raffles time is expired!');
  }
  if (!payload) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide the data!');
  }
  const result = await Ticket.create(payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to create!');
  }
  return result;
};

const getTickets = async () => {
  const result = await Ticket.aggregate([
    {
      $group: {
        _id: '$user',
        totalTickets: { $sum: '$qty' },
      },
    },
    {
      $lookup: {
        from: 'users', // MongoDB collection name (should be lowercase and plural by default)
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        totalTickets: 1,
        name: '$user.name',
        profileImg: '$user.profileImg',
      },
    },
  ]);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to Get Data!');
  }
  return result;
};

const getMyTickets = async (userId: string) => {
  const result = await Ticket.aggregate([
    {
      $match: { user: new Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: '$user',
        totalTickets: { $sum: '$qty' },
        tickets: { $push: '$$ROOT' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        totalTickets: 1,
        name: '$user.name',
        profileImg: '$user.profileImg',
        tickets: {
          $map: {
            input: '$tickets',
            as: 'ticket',
            in: {
              _id: '$$ticket._id',
              qty: '$$ticket.qty',
              createdAt: '$$ticket.createdAt',
            },
          },
        },
      },
    },
  ]);

  return result[0] || null;
};

const getMaxTicketHolder = async () => {
  const topTicketHolder = await Ticket.aggregate([
    {
      $group: {
        _id: '$user',
        totalQty: { $sum: '$qty' },
      },
    },
    {
      $sort: { totalQty: -1 },
    },
    {
      $limit: 1,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        totalQty: 1,
        user: {
          _id: 1,
          name: 1,
          profileImg: 1,
        },
      },
    },
  ]);

  if (!topTicketHolder) {
    throw new AppError(httpStatus.BAD_REQUEST, 'faild to find!');
  }
  return topTicketHolder;
};

const raiseTopper = async (userId: string, payload: { number: number }) => {
  if (!payload || !userId) {
    throw new AppError(httpStatus.NOT_FOUND, 'please provide userId/bonus!');
  }
  const result1 = await Raised.create({
    amount: payload.number,
    type: 'raffles',
    user: userId,
  });
  if (!result1) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to create!');
  }
  const result2 = await User.findOneAndUpdate(
    { _id: userId },
    {
      $inc: {
        withdraw: payload.number,
        totalRaised: payload.number,
      },
    },
    { new: true },
  );
  if (!result2) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update!');
  }

  return null;
};

const deleteRuffles = async (_id: string) => {
  if (!_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'id not found!');
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await Ruffles.deleteOne({ _id }, { session });
    if (result.deletedCount === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to delete Ruffles!');
    }
    const deleteTickets = await Ticket.deleteMany({ session });
    if (!deleteTickets) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to delete Tickets!');
    }
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.log(err);
  } finally {
    session.endSession();
  }
};

export const TicketServices = {
  createRuffles,
  createTicket,
  getTickets,
  getMyTickets,
  getMaxTicketHolder,
  raiseTopper,
  deleteRuffles,
};
