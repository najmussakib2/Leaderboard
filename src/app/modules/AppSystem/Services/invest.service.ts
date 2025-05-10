import httpStatus from 'http-status';
import { User } from '../../User/user.model';
import { Investment } from '../Models/invest.model';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { Raised } from '../Models/raised.model';
import { Rank } from '../Models/rank.model';


const investMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findOne({ _id: userId }).session(session);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

    // 1. Create investment
    await Investment.create([{ user: userId, amount }], { session });

    // 2. Create referral raised record (if needed)
    if (user.recommendedBy) {
      const bonus = amount * 0.1;
      await Raised.create([{ user: user.recommendedBy, investor: userId, type: "bonus", amount: bonus }], { session });

      // Update inviter's raised total and rank
      const inviterTotalRaised = await Raised.aggregate([
        { $match: { user: user.recommendedBy } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).session(session);

      const totalRaised = inviterTotalRaised[0]?.total || 0;

      const higherRaised = await Rank.countDocuments({
        totalRaised: { $gt: totalRaised },
      }).session(session);

      const newRaisedRank = higherRaised + 1;

      const inviterRank = await Rank.findOne({ user: user.recommendedBy }).session(session);
      if (inviterRank) {
        if (inviterRank.raisedRank !== newRaisedRank) {
          inviterRank.prevRaisedRank.push({ date: new Date(), number: inviterRank.raisedRank });
          inviterRank.raisedRank = newRaisedRank;
        }
        inviterRank.totalRaised = totalRaised;
        await inviterRank.save({ session });
      } else {
        await Rank.create(
          [
            {
              user: user.recommendedBy,
              rank: 0,
              prevRank: [],
              raisedRank: newRaisedRank,
              prevRaisedRank: [],
              totalInvest: 0,
              totalRaised,
            },
          ],
          { session },
        );
      }
    }

    // 3. Update investor's own investment rank
    const userTotalInvest = await Investment.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).session(session);

    const totalInvest = userTotalInvest[0]?.total || 0;

    const higherInvest = await Rank.countDocuments({
      totalInvest: { $gt: totalInvest },
    }).session(session);

    const newRank = higherInvest + 1;

    const userRank = await Rank.findOne({ user: user._id }).session(session);
    if (userRank) {
      if (userRank.rank !== newRank) {
        userRank.prevRank.push({ date: new Date(), number: userRank.rank });
        userRank.rank = newRank;
      }
      userRank.totalInvest = totalInvest;
      await userRank.save({ session });
    } else {
      await Rank.create(
        [
          {
            user: user._id,
            rank: newRank,
            prevRank: [],
            raisedRank: 0,
            prevRaisedRank: [],
            totalInvest,
            totalRaised: 0,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    console.log('Investment processed and rank updated for one user.');
  } catch (err) {
    await session.abortTransaction();
    console.error('Transaction failed:', err);
    throw err;
  } finally {
    session.endSession();
  }
};



export const InvestServices = {
  investMoney,
};
