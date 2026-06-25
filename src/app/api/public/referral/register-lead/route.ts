import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import { getReferralSettings } from '@/features/shared/model/referral-setting';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notification';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, reward, } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone number/WhatsApp are required fields.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    await connectDB();

    // Check if user already exists in system by phone or email
    const queryConditions: Array<{ phone: string } | { email: string }> = [{ phone: cleanPhone }];
    if (cleanEmail) {
      queryConditions.push({ email: cleanEmail });
    }

    const existingUser = await User.findOne({
      $or: queryConditions
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'An account with this mobile number or email is already registered. Please log in directly or use another number.' 
        },
        { status: 400 }
      );
    }

    // Determine name breakdown
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '.';

    // Generate unique placeholder email if omitted
    let defaultEmail = cleanEmail;
    if (!defaultEmail) {
      const sanitizedPhoneNum = cleanPhone.replace(/\D/g, '') || Math.floor(Math.random() * 10000000).toString();
      defaultEmail = `${sanitizedPhoneNum}@spentsmart.local`;

      // Double-check placeholder email uniqueness
      const checkEmailConflict = await User.findOne({ email: defaultEmail });
      if (checkEmailConflict) {
        defaultEmail = `${sanitizedPhoneNum}_${Math.floor(Math.random() * 1000)}@spentsmart.local`;
      }
    }

    // Define a default login password
    const rawNumberDigits = cleanPhone.replace(/\D/g, '') || '123456';
    const defaultPassword = `Welcome@${rawNumberDigits}`;

    // Read cookie for referrer attribution
    let appliedCode = '';
    let referredByObj = undefined;
    let validCodeDoc = null;

    try {
      const cookieStore = await cookies();
      const cookieRef = cookieStore.get('referral_code')?.value;
      if (cookieRef) {
        appliedCode = cookieRef.trim().toUpperCase();
        validCodeDoc = await ReferralCode.findOne({
          code: appliedCode,
          is_active: true,
          $or: [
            { expires_at: { $exists: false } },
            { expires_at: { $gt: new Date() } }
          ]
        });

        if (validCodeDoc) {
          const referrerUser = await User.findById(validCodeDoc.referrer_id);
          if (referrerUser) {
            referredByObj = {
              referrerId: referrerUser._id,
              referrerEmail: referrerUser.email
            };
          }
        }
      }
    } catch (cookieErr) {
      console.warn('Could not read referral cookie during lead registration:', cookieErr);
    }

    // Create user model
    const user = new User({
      firstName,
      lastName,
      email: defaultEmail,
      phone: cleanPhone,
      password: defaultPassword,
      role: 'customer',
      status: 'active', // active immediately for direct login access
      emailVerified: true, // Bypass verification since phone/WhatsApp validation handles it
      referredBy: referredByObj
    });

    // Generate active referral code for this new user client
    let userReferralCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      userReferralCode = user.generateReferralCode();
      const existingDoc = await ReferralCode.findOne({ code: userReferralCode });
      if (!existingDoc) {
        isUnique = true;
      }
      attempts++;
    }

    if (isUnique) {
      user.referralCode = userReferralCode;
    }

    // Save User
    await user.save();

    const settings = await getReferralSettings();

    // Create active ReferralCode document
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
            referralBonus: settings.referral_bonus_amount || 500
          }
        });
      } catch (err) {
        console.error('Error creating referral code for lead:', err);
      }
    }

    // Create ReferralReward ledger, setting preferred reward type
    try {
      const ledger = await getOrCreateRewardLedger(user._id);
      ledger.preferred_reward_type = reward?.toLowerCase().includes('sub') ? 'subscription' : 'cash';
      await ledger.save();
    } catch (err) {
      console.error('Error seeding ledger for lead:', err);
    }

    // Trigger in-app notifications
    try {
      await createNotification({
        recipientId: user._id,
        title: 'Welcome to SpendSmart! 🎉',
        message: `Your account was created successfully. We've initialized your profile with a signup discount reward!`,
        type: 'reward',
        actionUrl: '/client/referral'
      });

      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          title: 'New Client Registered',
          message: `${user.fullName} (${user.email}) registered as a new lead.`,
          type: 'system',
          actionUrl: '/admin/clients'
        });
      }
    } catch (err) {
      console.error('Error triggering lead signup notifications:', err);
    }

    // Create conversion funnel logs as stage 'visited' / 'signed_up'
    if (validCodeDoc && referredByObj) {
      try {
        const ipHeader = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const clientIp = ipHeader.split(',')[0].trim();

        await ReferralConversion.create({
          referral_code: validCodeDoc.code,
          referrer_id: validCodeDoc.referrer_id,
          prospect_id: user._id,
          prospect_email: user.email,
          conversion_stage: 'signed_up',
          timeline: {
            clicked_at: new Date(),
            signed_up_at: new Date()
          },
          metadata: {
            ip_address: clientIp,
            user_agent: req.headers.get('user-agent') || 'unknown'
          }
        });
      } catch (err) {
        console.error('Error logging lead signup conversion:', err);
      }
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const finalReferralLink = `${appUrl}/ref/${user.referralCode || 'REF'}`;

    return NextResponse.json({
      success: true,
      message: 'Account created and referral link generated successfully!',
      loginCredentials: {
        username: cleanPhone,
        email: defaultEmail,
        password: defaultPassword
      },
      referralLink: finalReferralLink,
      code: user.referralCode
    }, { status: 201 });

  } catch (error) {
    console.error('Register lead error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during automatic registration.' },
      { status: 500 }
    );
  }
}
