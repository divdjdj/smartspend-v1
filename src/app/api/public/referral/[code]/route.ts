import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReferralCode from '@/features/shared/model/referral-code';
import User from '@/features/shared/model/user';
import { getReferralSettings } from '@/features/shared/model/referral-setting';

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required.' }, { status: 400 });
    }

    await connectDB();

    const referralCodeDoc = await ReferralCode.findOne({
      code: code.trim().toUpperCase(),
      is_active: true,
      $or: [
        { expires_at: { $exists: false } },
        { expires_at: { $gt: new Date() } }
      ]
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
        name: referrerUser.fullName
      },
      discountAmount: settings.referral_bonus_amount || referralCodeDoc.reward.referralBonus || 500,
      rewardType: referralCodeDoc.reward.type
    });

  } catch (error) {
    console.error('Get public referral data error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading referral data.' },
      { status: 500 }
    );
  }
}
