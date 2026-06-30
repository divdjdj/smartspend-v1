import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/features/shared/model/user';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import { getReferralSettings } from '@/features/shared/model/referral-setting';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notification';

// This route creates a new REFERRAL PARTNER account (User with role: referral_partner).
// End-customers/clients are NOT created here — they are saved to the Client model via /api/enquiry.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, reward } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone number/WhatsApp are required fields.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    await connectDB();

    // Check if a User (partner/admin) already exists with this phone or email
    const queryConditions: Array<{ phone: string } | { email: string }> = [{ phone: cleanPhone }];
    if (cleanEmail) queryConditions.push({ email: cleanEmail });

    const existingUser = await User.findOne({ $or: queryConditions });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'An account with this mobile number or email is already registered. Please log in directly or use another number.',
        },
        { status: 400 }
      );
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Partner';
    const lastName = nameParts.slice(1).join(' ') || '.';

    const rawNumberDigits = cleanPhone.replace(/\D/g, '') || '123456';
    const defaultPassword = `Welcome@${rawNumberDigits}`;

    // Read referral cookie (a partner may themselves have been referred)
    let appliedCode = '';
    let validCodeDoc = null;

    try {
      const cookieStore = await cookies();
      const cookieRef = cookieStore.get('referral_code')?.value;
      if (cookieRef) {
        appliedCode = cookieRef.trim().toUpperCase();
        validCodeDoc = await ReferralCode.findOne({
          code: appliedCode,
          is_active: true,
          $or: [{ expires_at: { $exists: false } }, { expires_at: { $gt: new Date() } }],
        });
      }
    } catch (cookieErr) {
      console.warn('Could not read referral cookie during lead registration:', cookieErr);
    }

    const userPayload: Partial<IUser> = {
      firstName,
      lastName,
      phone: cleanPhone,
      password: defaultPassword,
      role: 'referral_partner',
      status: 'active',
      emailVerified: true,
    };

    let finalEmail = cleanEmail;
    if (!finalEmail) {
      const sanitizedPhoneNum = cleanPhone.replace(/\D/g, '') || Math.floor(Math.random() * 10000000).toString();
      finalEmail = `${sanitizedPhoneNum}@spentsmart.local`;
    }
    userPayload.email = finalEmail;

    const user = new User(userPayload);

    // Generate unique referral code
    let userReferralCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      userReferralCode = user.generateReferralCode();
      const existingDoc = await ReferralCode.findOne({ code: userReferralCode });
      if (!existingDoc) isUnique = true;
      attempts++;
    }
    if (isUnique) user.referralCode = userReferralCode;

    await user.save();

    const settings = await getReferralSettings();

    // Create ReferralCode document for this new partner
    if (user.referralCode) {
      try {
        await ReferralCode.create({
          code: user.referralCode,
          referrer_id: user._id,
          is_active: true,
          reward: {
            type: reward?.toLowerCase().includes('sub') ? 'subscription' : 'cash',
            cashAmount: settings.cash_reward_high || 1000,
            subscriptionMonths: settings.subscription_months || 3,
            referralBonus: settings.referral_bonus_amount || 500,
          },
        });
      } catch (err) {
        console.error('Error creating referral code for partner:', err);
      }
    }

    // Seed reward ledger
    try {
      const ledger = await getOrCreateRewardLedger(user._id);
      ledger.preferred_reward_type = reward?.toLowerCase().includes('sub') ? 'subscription' : 'cash';
      await ledger.save();
    } catch (err) {
      console.error('Error seeding ledger for partner:', err);
    }

    // Log referral conversion for whoever referred this partner
    if (validCodeDoc) {
      try {
        const ipHeader = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const clientIp = ipHeader.split(',')[0].trim();
        await ReferralConversion.create({
          referral_code: validCodeDoc.code,
          referrer_id: validCodeDoc.referrer_id,
          prospect_id: user._id,
          prospect_email: user.email,
          conversion_stage: 'signed_up',
          timeline: { clicked_at: new Date(), signed_up_at: new Date() },
          metadata: { ip_address: clientIp, user_agent: req.headers.get('user-agent') || 'unknown' },
        });
      } catch (err) {
        console.error('Error logging partner signup conversion:', err);
      }
    }

    // Notify admins
    try {
      await createNotification({
        recipientId: user._id,
        title: 'Welcome to SpendSmart! 🎉',
        message: `Your referral partner account was created. Start sharing your link to earn rewards!`,
        type: 'reward',
        actionUrl: '/partner/referral',
      });

      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          title: 'New Referral Partner Registered',
          message: `${user.fullName} (${user.email}) registered as a new referral partner.`,
          type: 'system',
          actionUrl: '/admin/referral',
        });
      }
    } catch (err) {
      console.error('Error triggering partner signup notifications:', err);
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const finalReferralLink = `${appUrl}/ref/${user.referralCode || 'REF'}`;

    return NextResponse.json(
      {
        success: true,
        message: 'Referral partner account created successfully!',
        loginCredentials: {
          username: cleanPhone,
          email: finalEmail,
          password: defaultPassword,
        },
        referralLink: finalReferralLink,
        code: user.referralCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register lead error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during automatic registration.' },
      { status: 500 }
    );
  }
}
