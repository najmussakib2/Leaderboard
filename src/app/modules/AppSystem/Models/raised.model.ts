/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TRaised } from '../Interfaces/invest.interface';

const raisedSchema = new Schema<TRaised>(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  },
);


export const Investment = model<TRaised>('Invesment', raisedSchema);
