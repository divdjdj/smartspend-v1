import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralCode from '@/features/shared/model/referral-code';
import { getReferralSettings } from '@/features/shared/model/referral-setting';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Check if code already exists
    if (user.referralCode) {
      return NextResponse.json({ 
        success: true, 
        message: 'Referral code already exists.', 
        code: user.referralCode 
      });
    }

    // Generate unique code
    let generatedCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      generatedCode = user.generateReferralCode();
      const existingDoc = await ReferralCode.findOne({ code: generatedCode });
      if (!existingDoc) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate a unique referral code. Please try again.' }, { status: 500 });
    }

    const settings = await getReferralSettings();

    // Create the ReferralCode record
    const referralCodeDoc = await ReferralCode.create({
      code: generatedCode,
      referrer_id: user._id,
      is_active: true,
      reward: {
        type: 'cash', // default preference
        cashAmount: settings.cash_reward_high || 1000,
        subscriptionMonths: settings.subscription_months || 3,
        referralBonus: settings.referral_bonus_amount || 500
      }
    });

    // Update the User document
    user.referralCode = generatedCode;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Referral code generated successfully.',
      code: generatedCode,
      rewardConfig: referralCodeDoc.reward
    }, { status: 201 });

  } catch (error) {
    console.error('Customer generate referral code error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating referral code.' },
      { status: 500 }
    );
  }
}
