import { Types } from "mongoose";

export interface TInvest {
  _id: Types.ObjectId;
  amount: number;
  user: Types.ObjectId
}

export interface TRaised {
  _id: Types.ObjectId;
  amount: number;
  type: string;
  user: Types.ObjectId
}