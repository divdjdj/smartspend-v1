import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
  name: string;
  mobile: string;
  email?: string;
  subscription?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'resolved' | 'ignored';
  notes?: string;
  referralCode?: string;
  referredBy?: {
    referrerId?: mongoose.Types.ObjectId;
    referrerEmail?: string;
  };
  client_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  subscription: { type: String, trim: true },
  message: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'contacted', 'resolved', 'ignored'], 
    default: 'pending',
    index: true
  },
  notes: { type: String, trim: true },
  referralCode: { type: String, uppercase: true, trim: true },
  referredBy: {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User' },
    referrerEmail: { type: String }
  },
  client_id: { type: Schema.Types.ObjectId, ref: 'User', index: true }
}, {
  timestamps: true
});

const Enquiry = mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
export default Enquiry;
