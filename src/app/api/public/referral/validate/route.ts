import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReferralCode from '@/features/shared/model/referral-code';
import User from '@/features/shared/model/user';
import { getReferralSettings } from '@/features/shared/model/referral-setting';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required.' }, { status: 400 });
    }

    await connectDB();

    const referralCodeDoc = await ReferralCode.findOne({
      code: code.trim().toUpperCase(),
      is_active: true
    });

    if (!referralCodeDoc) {
      return NextResponse.json({ isValid: false, error: 'Invalid or inactive referral code.' }, { status: 404 });
    }

    const referrerUser = await User.findById(referralCodeDoc.referrer_id);
    if (!referrerUser) {
      return NextResponse.json({ isValid: false, error: 'Referrer not found.' }, { status: 404 });
    }

    const settings = await getReferralSettings();

    return NextResponse.json({
      isValid: true,
      code: referralCodeDoc.code,
      referrer: {
        name: referrerUser.fullName,
        email: referrerUser.email
      },
      discountAmount: settings.referral_bonus_amount || referralCodeDoc.reward.referralBonus || 500,
      rewardType: referralCodeDoc.reward.type
    });

  } catch (error) {
    console.error('Validate referral code error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while validating referral code.' },
      { status: 500 }
    );
  }
}
