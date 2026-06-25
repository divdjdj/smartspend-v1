import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferralCode extends Document {
  code: string;
  referrer_id: mongoose.Types.ObjectId;
  is_active: boolean;
  expires_at?: Date;
  reward: {
    type: 'cash' | 'subscription';
    cashAmount: number;
    subscriptionMonths: number;
    referralBonus: number;
  };
  created_at?: Date;
}

const ReferralCodeSchema = new Schema<IReferralCode>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  referrer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  is_active: { type: Boolean, default: true },
  expires_at: { type: Date },
  reward: {
    type: { type: String, enum: ['cash', 'subscription'], default: 'cash' },
    cashAmount: { type: Number, default: 1000 },
    subscriptionMonths: { type: Number, default: 3 },
    referralBonus: { type: Number, default: 500 }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.ReferralCode;
}

const ReferralCode = mongoose.models.ReferralCode as Model<IReferralCode> || 
  mongoose.model<IReferralCode>('ReferralCode', ReferralCodeSchema);

export default ReferralCode;
