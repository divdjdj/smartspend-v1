import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Subscription Interface
export interface ISubscription {
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

// Login History Interface
export interface ILoginHistory {
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
}

// User Document Interface
// NOTE: Users are ONLY admins and referral partners. End-customers live in the Client model.
export interface IUser extends Document {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountType: string;
  role: 'admin' | 'referral_partner';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  isSuperAdmin?: boolean;
  referralCode?: string;
  isDeleted?: boolean;
  accountBalance: number;
  subscriptions: ISubscription[];
  loginHistory: ILoginHistory[];
  createdAt?: Date;
  updatedAt?: Date;
  
  // Virtuals
  fullName: string;
  isLocked: boolean;

  // Instance Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  createEmailVerificationToken(): string;
  verifyEmail(): Promise<void>;
  createPasswordResetToken(): string;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  addLoginHistory(ip: string, userAgent: string, success: boolean): void;
  generateReferralCode(): string;
  addSubscription(subscriptionData: Partial<ISubscription>): void;
  cancelSubscription(subscriptionId: string): void;
  getActiveSubscriptions(): ISubscription[];
  hasPermission(permissionName: string): boolean;
  sanitize(): Record<string, unknown>;
}

// User Model Interface (for statics)
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): mongoose.Query<IUser | null, IUser>;
  findByEmailVerificationToken(token: string): Promise<IUser | null>;
  findByPasswordResetToken(token: string): Promise<IUser | null>;
  findByReferralCode(code: string): Promise<IUser | null>;
  createAdmin(adminData: Record<string, unknown>): Promise<IUser>;
  searchUsers(query: string, filters?: Record<string, unknown>): Promise<IUser[]>;
  getAdminStats(): Promise<Record<string, unknown>>;
}

const SubscriptionSchema = new Schema<ISubscription>({
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  billingCycle: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true }
});

const LoginHistorySchema = new Schema<ILoginHistory>({
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new Schema<IUser, IUserModel>({
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  phone: { type: String, trim: true },
  accountType: { type: String, default: 'individual' },
  // Only 'admin' and 'referral_partner' may exist in the User collection.
  // End-customers are stored in the Client model.
  role: { type: String, enum: ['admin', 'referral_partner'], default: 'referral_partner' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationTokenExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  loginAttempts: { type: Number, default: 0, required: true },
  lockUntil: { type: Date },
  isSuperAdmin: { type: Boolean, default: false, select: false },
  referralCode: { type: String, unique: true, sparse: true },
  isDeleted: { type: Boolean, default: false },
  accountBalance: { type: Number, default: 0 },
  subscriptions: [SubscriptionSchema],
  loginHistory: [LoginHistorySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save password hashing
UserSchema.pre('save', async function(this: IUser) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

// Virtuals
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email || this.phone || 'User';
});

UserSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Instance Methods
UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.createEmailVerificationToken = function(this: IUser): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.emailVerificationToken = token;
  // Expires in 24 hours
  this.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

UserSchema.methods.verifyEmail = async function(this: IUser): Promise<void> {
  this.emailVerified = true;
  this.emailVerificationToken = undefined;
  this.emailVerificationTokenExpires = undefined;
  this.status = 'active';
  await this.save();
};

UserSchema.methods.createPasswordResetToken = function(this: IUser): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.passwordResetToken = token;
  // Expires in 1 hour
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  return token;
};

UserSchema.methods.incLoginAttempts = async function(this: IUser): Promise<void> {
  // If lock expired, reset attempts to 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    // Lock account after 5 attempts for 2 hours
    if (this.loginAttempts >= 5) {
      this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
    }
  }
  await this.save();
};

UserSchema.methods.resetLoginAttempts = async function(this: IUser): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

UserSchema.methods.addLoginHistory = function(this: IUser, ip: string, userAgent: string, success: boolean): void {
  this.loginHistory.push({
    ip,
    userAgent,
    success,
    timestamp: new Date()
  });
  // Keep history to last 50 entries
  if (this.loginHistory.length > 50) {
    this.loginHistory.shift();
  }
};

UserSchema.methods.generateReferralCode = function(this: IUser): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SS';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

UserSchema.methods.addSubscription = function(this: IUser, subscriptionData: Partial<ISubscription>): void {
  const defaultEndDate = new Date();
  if (subscriptionData.billingCycle === 'monthly') {
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
  } else if (subscriptionData.billingCycle === 'yearly') {
    defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
  } else {
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 1); // fallback
  }

  this.subscriptions.push({
    packageId: subscriptionData.packageId || 'default',
    packageName: subscriptionData.packageName || 'Basic Plan',
    billingCycle: subscriptionData.billingCycle || 'monthly',
    price: subscriptionData.price || 0,
    discount: subscriptionData.discount || 0,
    totalPrice: subscriptionData.totalPrice || (subscriptionData.price || 0) - (subscriptionData.discount || 0),
    status: 'active',
    startDate: new Date(),
    endDate: subscriptionData.endDate || defaultEndDate
  });
};

UserSchema.methods.cancelSubscription = function(this: IUser, subscriptionId: string): void {
  const sub = this.subscriptions.find(s => s._id?.toString() === subscriptionId || s.packageId === subscriptionId);
  if (sub) {
    sub.status = 'cancelled';
  }
};

UserSchema.methods.getActiveSubscriptions = function(this: IUser): ISubscription[] {
  const now = new Date();
  return this.subscriptions.filter(s => s.status === 'active' && s.endDate > now);
};

UserSchema.methods.hasPermission = function(this: IUser, permissionName: string): boolean {
  if (this.isSuperAdmin) return true;
  if (this.role === 'admin') return true;
  
  // Referral partners have access to their own dashboard and referral management
  const partnerPermissions = ['view_dashboard', 'manage_own_referrals', 'view_referred_clients'];
  if (this.role === 'referral_partner' && partnerPermissions.includes(permissionName)) {
    return true;
  }
  return false;
};

UserSchema.methods.sanitize = function(this: IUser): Record<string, unknown> {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationTokenExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.isSuperAdmin;
  delete obj.isDeleted;
  return obj;
};

// Statics
UserSchema.statics.findByEmail = function(this: IUserModel, email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

UserSchema.statics.findByEmailVerificationToken = async function(this: IUserModel, token: string): Promise<IUser | null> {
  return this.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: new Date() }
  });
};

UserSchema.statics.findByPasswordResetToken = async function(this: IUserModel, token: string): Promise<IUser | null> {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });
};

UserSchema.statics.findByReferralCode = async function(this: IUserModel, code: string): Promise<IUser | null> {
  return this.findOne({ referralCode: code.toUpperCase() });
};

UserSchema.statics.createAdmin = async function(this: IUserModel, adminData: Record<string, unknown>): Promise<IUser> {
  return this.create({
    ...adminData,
    role: 'admin',
    emailVerified: true
  });
};

UserSchema.statics.createReferralPartner = async function(this: IUserModel, partnerData: Record<string, unknown>): Promise<IUser> {
  return this.create({
    ...partnerData,
    role: 'referral_partner',
    emailVerified: true
  });
};

UserSchema.statics.searchUsers = async function(this: IUserModel, query: string, filters: Record<string, unknown> = {}): Promise<IUser[]> {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    ...filters,
    isDeleted: { $ne: true },
    $or: [
      { email: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex }
    ]
  });
};

UserSchema.statics.getAdminStats = async function(this: IUserModel): Promise<Record<string, unknown>> {
  const baseFilter = { isDeleted: { $ne: true } };
  const totalUsers = await this.countDocuments(baseFilter);
  const activeUsers = await this.countDocuments({ ...baseFilter, status: 'active' });
  const partnersCount = await this.countDocuments({ ...baseFilter, role: 'referral_partner' });
  const adminsCount = await this.countDocuments({ ...baseFilter, role: 'admin' });
  const verifiedEmails = await this.countDocuments({ ...baseFilter, emailVerified: true });

  return {
    totalUsers,
    activeUsers,
    partnersCount,
    adminsCount,
    verifiedEmails,
  };
};

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

const User = mongoose.models.User as IUserModel || mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
