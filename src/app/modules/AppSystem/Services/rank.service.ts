
import { Rank } from '../Models/rank.model';
import { Investment } from '../Models/invest.model';
import { User } from '../../User/user.model';
import { Raised } from '../Models/raised.model';

const getUsersByRank = async () => {

   // Step 1: Aggregate total investment per user
   const investmentTotals = await Investment.aggregate([
    {
      $group: {
        _id: '$user',
        totalInvest: { $sum: '$amount' },
      },
    },
    {
      $sort: { totalInvest: -1 },
    },
  ]);

  // Step 2: Load current and previous rank from Rank schema
  const userIds = investmentTotals.map((entry) => entry._id);

  const ranks = await Rank.find({ user: { $in: userIds } }).lean();

  const ranksMap = new Map();
  for (const rank of ranks) {
    ranksMap.set(rank.user.toString(), {
      currentRank: rank.rank,
      previousRank:
        rank.prevRank.length > 0
          ? rank.prevRank[rank.prevRank.length - 1].number
          : null,
    });
  }

  // Optional: Load user names/emails if needed
  const users = await User.find({ _id: { $in: userIds } }, { name: 1 }).lean();
  const userMap = new Map();
  for (const user of users) {
    userMap.set(user._id.toString(), user);
  }

  // Step 3: Assemble final leaderboard
  const leaderboard = investmentTotals.map((entry, index) => {
    const uid = entry._id.toString();
    return {
      userId: uid,
      name: userMap.get(uid)?.name || 'Unknown',
      profileImg: userMap.get(uid)?.profileImg || 'Unknown',
      totalInvest: entry.totalInvest,
      currentRank: ranksMap.get(uid)?.currentRank ?? index + 1, // fallback
      previousRank: ranksMap.get(uid)?.previousRank ?? null,
    };
  });

  return leaderboard;

};


const getUsersByRaisedRank = async () => {
  // Step 1: Aggregate total raised amount per user
  const raisedTotals = await Raised.aggregate([
    {
      $group: {
        _id: '$user',
        totalRaised: { $sum: '$amount' },
      },
    },
    {
      $sort: { totalRaised: -1 },
    },
  ]);

  const userIds = raisedTotals.map((entry) => entry._id);

  // Step 2: Get rank info from Rank schema
  const ranks = await Rank.find({ user: { $in: userIds } }).lean();

  const ranksMap = new Map();
  for (const rank of ranks) {
    ranksMap.set(rank.user.toString(), {
      currentRaisedRank: rank.raisedRank,
      previousRaisedRank:
        rank.prevRaisedRank.length > 0
          ? rank.prevRaisedRank[rank.prevRaisedRank.length - 1].number
          : null,
    });
  }

  // Optional: Get user names
  const users = await User.find({ _id: { $in: userIds } }, { name: 1 }).lean();
  const userMap = new Map();
  for (const user of users) {
    userMap.set(user._id.toString(), user);
  }

  // Step 3: Assemble leaderboard
  const leaderboard = raisedTotals.map((entry, index) => {
    const uid = entry._id.toString();
    return {
      userId: uid,
      name: userMap.get(uid)?.name || 'Unknown',
      profileImg: userMap.get(uid)?.profileImg || 'Unknown',
      totalRaised: entry.totalRaised,
      currentRaisedRank: ranksMap.get(uid)?.currentRaisedRank ?? index + 1,
      previousRaisedRank: ranksMap.get(uid)?.previousRaisedRank ?? null,
    };
  });

  return leaderboard;
}

export const RankServices = {
  getUsersByRank,
  getUsersByRaisedRank
};
