import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferralConversion extends Document {
  referral_code: string;
  referrer_id: mongoose.Types.ObjectId;
  prospect_id?: mongoose.Types.ObjectId;
  prospect_email?: string;
  conversion_stage: 'clicked' | 'visited' | 'signed_up' | 'purchased' | 'cancelled';
  timeline: {
    clicked_at?: Date;
    visited_at?: Date;
    signed_up_at?: Date;
    purchased_at?: Date;
    cancelled_at?: Date;
  };
  metadata?: {
    user_agent?: string;
    ip_address?: string;
    device_type?: string;
    browser?: string;
    os?: string;
  };
  purchase_details?: {
    gross_amount: number;
    referral_bonus_applied: number;
    net_amount: number;
    referrer_reward: number;
  };
  referrer_reward?: {
    type: 'cash' | 'subscription';
    amount: number;
    status: 'calculated' | 'credited' | 'claimed';
    claimed_at?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ReferralConversionSchema = new Schema<IReferralConversion>({
  referral_code: { type: String, required: true, index: true },
  referrer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  prospect_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  prospect_email: { type: String, trim: true },
  conversion_stage: { 
    type: String, 
    enum: ['clicked', 'visited', 'signed_up', 'purchased', 'cancelled'], 
    default: 'clicked',
    index: true
  },
  timeline: {
    clicked_at: { type: Date, default: Date.now },
    visited_at: { type: Date },
    signed_up_at: { type: Date },
    purchased_at: { type: Date },
    cancelled_at: { type: Date }
  },
  metadata: {
    user_agent: { type: String },
    ip_address: { type: String },
    device_type: { type: String },
    browser: { type: String },
    os: { type: String }
  },
  purchase_details: {
    gross_amount: { type: Number },
    referral_bonus_applied: { type: Number },
    net_amount: { type: Number },
    referrer_reward: { type: Number }
  },
  referrer_reward: {
    type: { type: String, enum: ['cash', 'subscription'] },
    amount: { type: Number },
    status: { type: String, enum: ['calculated', 'credited', 'claimed'], default: 'calculated' },
    claimed_at: { type: Date }
  }
}, {
  timestamps: true
});

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.ReferralConversion;
}

const ReferralConversion = mongoose.models.ReferralConversion as Model<IReferralConversion> || 
  mongoose.model<IReferralConversion>('ReferralConversion', ReferralConversionSchema);

export default ReferralConversion;
