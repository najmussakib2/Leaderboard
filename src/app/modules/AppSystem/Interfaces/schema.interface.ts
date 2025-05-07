import { Types } from 'mongoose';

export interface TInvest {
  _id: Types.ObjectId;
  amount: number;
  user: Types.ObjectId;
}

export interface TRaised {
  _id: Types.ObjectId;
  amount: number;
  type: string;
  user: Types.ObjectId;
}

export interface TMedia {
  _id: Types.ObjectId;
  name: string;
  link: string;
  iconImg: string;
  user: Types.ObjectId;
}

export interface TTicket {
  _id: Types.ObjectId;
  qty: number;
  user: Types.ObjectId;
}

interface PrevRankEntry {
  date: Date;
  number: number;
}
export interface TRank {
  _id: Types.ObjectId;
  rank: number;
  prevRank: PrevRankEntry[];
  totalInvest: number;
  totalRaised: number;
  user: Types.ObjectId;
}

export interface TOTP {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
}
