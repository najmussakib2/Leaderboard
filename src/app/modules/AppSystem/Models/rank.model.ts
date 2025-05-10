/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TRank } from '../Interfaces/schema.interface';

const rankingSchema = new Schema<TRank>(
  {
    rank: {
      type: Number,
      required: true,
    },

    prevRank: {
      type: [{
        date: { type: Date, required: true },
        number: { type: Number, required: true }
      }],
      required: true
    },

    raisedRank: {
      type: Number,
      required: true,
    },

    prevRaisedRank: {
      type: [{
        date: { type: Date, required: true },
        number: { type: Number, required: true }
      }],
      required: true
    },
    
    totalInvest: {
      type: Number,
      required: true,
    },

    totalRaised: {
      type: Number,
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Rank = model<TRank>('Rank', rankingSchema);
