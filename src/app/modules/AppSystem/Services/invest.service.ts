import httpStatus from 'http-status';
import { User } from '../../User/user.model';
import { Investment } from '../Models/invest.model';
import mongoose, { Types, UpdateQuery } from 'mongoose';
import AppError from '../../../errors/AppError';
import { Raised } from '../Models/raised.model';

export const investMoney = async (userId: string, amount: number) => {
  if (!amount || amount <= 0)
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid amount');
  if (!userId) throw new AppError(httpStatus.BAD_REQUEST, 'User Id not Found!');

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');

    const bonus = amount * 0.1;
    const adminAmount = amount - bonus;
    const updates: UpdateQuery<{
      totalInvest: number;
      totalAdminAmount: number;
      totalRefferedAmount?: number;
    }> = {
      $inc: {
        totalInvest: amount,
        totalAdminAmount: adminAmount,
      },
    };
    updates.$inc = updates.$inc || {};

    // Create investment
    const investmentData: {
      user: string;
      amount: number;
      adminAmount?: number;
      refferedAmount?: number;
    } = {
      user: userId,
      amount,
    };

    if (user.recommendedBy) {
      investmentData.refferedAmount = bonus;
      investmentData.adminAmount = adminAmount;
      await Raised.create(
        [
          {
            user: user.recommendedBy,
            investor: userId,
            type: 'bonus',
            amount: bonus,
          },
        ],
        { session },
      );

      updates.$inc.totalRefferedAmount = bonus;

      // Update inviter
      const totalRaised = await Raised.aggregate([
        { $match: { user: user.recommendedBy } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
        .session(session)
        .then((res) => res[0]?.total || 0);

      const newRaisedRank = await User.countDocuments({
        totalRaised: { $gt: totalRaised },
      })
        .session(session)
        .then((res) => res + 1);

      const inviter = await User.findById(user.recommendedBy).session(session);
      if (!inviter)
        throw new AppError(httpStatus.NOT_FOUND, 'Inviter not found');

      if (inviter.raisedRank !== newRaisedRank) {
        inviter.prevRaisedRank?.push({
          date: new Date(),
          number: inviter.raisedRank ?? 0,
        });
        inviter.raisedRank = newRaisedRank;
      }

      inviter.totalRaised = totalRaised;
      inviter.withdraw = (inviter.withdraw || 0) + bonus;
      await inviter.save({ session });
    }

    investmentData.adminAmount = amount;

    await Investment.create([investmentData], { session });
    await User.findByIdAndUpdate(userId, updates, { session });

    // Update rank
    const totalInvest = await Investment.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
      .session(session)
      .then((res) => res[0]?.total || 0);

    const newRank = await User.countDocuments({
      totalInvest: { $gt: totalInvest },
    })
      .session(session)
      .then((res) => res + 1);

    if (user.rank !== newRank) {
      user.prevRank?.push({ date: new Date(), number: user.rank ?? 0 });
      user.rank = newRank;
    }

    user.totalInvest = totalInvest;
    await user.save({ session });

    await session.commitTransaction();
    console.log('Investment successful and rank updated.');

    return {
      message: 'Investment successful',
      rank: user.rank,
      raisedRank: user.raisedRank,
    };
  } catch (err) {
    await session.abortTransaction();
    console.error('Transaction failed:', err);
    throw err;
  } finally {
    session.endSession();
  }
};

export const raisedMoney = async (userId: string, amount: number) => {
  if (!userId || isNaN(amount)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid session metadata');
  }

  // 3. Create a new Raised record
  const result = await Raised.create({
    user: userId,
    type: 'winner',
    amount,
  });

  // 4. Calculate user's total raised
  const totalRaised = await Raised.aggregate([
    { $match: { user: new Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]).then((res) => res[0]?.total || 0);

  // 5. Determine new raised rank
  const newRaisedRank = await User.countDocuments({
    totalRaised: { $gt: totalRaised },
  }).then((count) => count + 1); // +1 because rank starts at 1

  // 6. Fetch and update user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Update rank history if changed
  if (user.raisedRank !== newRaisedRank) {
    user.prevRaisedRank?.push({
      date: new Date(),
      number: user.raisedRank ?? 0,
    });
    user.raisedRank = newRaisedRank;
  }

  // Update user totals
  user.totalRaised = totalRaised;
  user.withdraw = (user.withdraw || 0) + amount;

  await user.save();

  return result;
};

const investRevenueByMonth = async () => {
  const revenue = await Investment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalRevenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  const result = revenue.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    totalRevenue: item.totalRevenue,
    totalInvestments: item.count,
  }));

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to get!');
  }

  // Format for easy display
  return result;
};

export const InvestServices = {
  investMoney,
  investRevenueByMonth,
};
