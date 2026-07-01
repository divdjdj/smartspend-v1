import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Subscription Interface (client can purchase services)
export interface IClientSubscription {
  _id?: string | mongoose.Types.ObjectId;
  packageId: string;
  packageName: string;
  billingCycle: string;
  price: number;
  discount: number;
  totalPrice: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
}

// Client Document Interface
export interface IClient extends Document {
  // Personal Info
  name: string;
  mobile: string;
  email?: string;
  password?: string;

  // Enquiry / Interest Info
  subscription?: string;   // what they're interested in (from form)
  message?: string;

  // CRM Status
  status: 'pending' | 'contacted' | 'resolved' | 'ignored' | 'active' | 'inactive';
  notes?: string;

  // Referral Attribution
  referralCode?: string;   // code used by this client to sign up
  referredBy?: {
    referrerId?: mongoose.Types.ObjectId;  // the referral_partner User._id
    referrerEmail?: string;
  };

  // Source
  source: 'website_enquiry' | 'referral' | 'wishlist' | 'admin';

  // Purchases (future)
  subscriptions: IClientSubscription[];

  // Soft delete
  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IClientModel extends Model<IClient> {
  findByMobile(mobile: string): mongoose.Query<IClient | null, IClient>;
  findByEmail(email: string): mongoose.Query<IClient | null, IClient>;
}

const ClientSubscriptionSchema = new Schema<IClientSubscription>({
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  billingCycle: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
});

const ClientSchema = new Schema<IClient, IClientModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, sparse: true, index: true },
    password: { type: String, select: false },

    subscription: { type: String, trim: true },
    message: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'contacted', 'resolved', 'ignored', 'active', 'inactive'],
      default: 'pending',
      index: true,
    },
    notes: { type: String, trim: true },

    referralCode: { type: String, uppercase: true, trim: true, index: true },
    referredBy: {
      referrerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
      referrerEmail: { type: String },
    },

    source: {
      type: String,
      enum: ['website_enquiry', 'referral', 'wishlist', 'admin'],
      default: 'website_enquiry',
    },

    subscriptions: [ClientSubscriptionSchema],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save password hashing
ClientSchema.pre('save', async function(this: IClient) {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Methods
ClientSchema.methods.comparePassword = async function(this: IClient, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Statics
ClientSchema.statics.findByMobile = function (mobile: string) {
  return this.findOne({ mobile: mobile.trim() });
};

ClientSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Client;
}

const Client = mongoose.models.Client as IClientModel || mongoose.model<IClient, IClientModel>('Client', ClientSchema);

export default Client;

