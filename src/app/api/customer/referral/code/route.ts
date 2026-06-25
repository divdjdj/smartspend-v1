import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralCode from '@/features/shared/model/referral-code';

export async function GET() {
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

    let codeDoc = null;
    if (user.referralCode) {
      codeDoc = await ReferralCode.findOne({ code: user.referralCode });
    }

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode || null,
      isActive: codeDoc ? codeDoc.is_active : false,
      rewardConfig: codeDoc ? codeDoc.reward : null
    });

  } catch (error) {
    console.error('Customer get referral code error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching your referral code.' },
      { status: 500 }
    );
  }
}
