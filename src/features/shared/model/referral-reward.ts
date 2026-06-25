import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRedemption {
  _id?: string | mongoose.Types.ObjectId;
  type: 'cash_claim' | 'subscription_activation';
  amount: number;
  months: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

export interface IReferralReward extends Document {
  customer_id: mongoose.Types.ObjectId;
  total_earned: number;
  cash_earned: number;
  subscription_months: number;
  redemptions: IRedemption[];
  preferred_reward_type: 'cash' | 'subscription';
  createdAt?: Date;
  updatedAt?: Date;
}

const RedemptionSchema = new Schema<IRedemption>({
  type: { type: String, enum: ['cash_claim', 'subscription_activation'], required: true },
  amount: { type: Number, default: 0 },
  months: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  created_at: { type: Date, default: Date.now }
});

const ReferralRewardSchema = new Schema<IReferralReward>({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  total_earned: { type: Number, default: 0 },
  cash_earned: { type: Number, default: 0 },
  subscription_months: { type: Number, default: 0 },
  redemptions: [RedemptionSchema],
  preferred_reward_type: { type: String, enum: ['cash', 'subscription'], default: 'cash' }
}, {
  timestamps: true
});

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.ReferralReward;
}

const ReferralReward = mongoose.models.ReferralReward as Model<IReferralReward> || 
  mongoose.model<IReferralReward>('ReferralReward', ReferralRewardSchema);

export default ReferralReward;

// Helper to get or create reward ledger for a customer
export async function getOrCreateRewardLedger(customerId: string | mongoose.Types.ObjectId): Promise<IReferralReward> {
  let ledger = await ReferralReward.findOne({ customer_id: customerId });
  if (!ledger) {
    ledger = await ReferralReward.create({
      customer_id: customerId,
      total_earned: 0,
      cash_earned: 0,
      subscription_months: 0,
      redemptions: [],
      preferred_reward_type: 'cash'
    });
  }
  return ledger;
}
