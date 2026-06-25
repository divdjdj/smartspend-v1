import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import '@/features/shared/model/user'; // Needed for populate registration

interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const conversions = await ReferralConversion.find({ referrer_id: session.user.id })
      .populate('prospect_id', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    const formattedConversions = conversions.map(c => {
      const prospect = c.prospect_id as unknown as PopulatedUser;
      return {
        _id: c._id,
        referralCode: c.referral_code,
        conversionStage: c.conversion_stage,
        clickedAt: c.timeline.clicked_at || c.createdAt,
        signedUpAt: c.timeline.signed_up_at,
        purchasedAt: c.timeline.purchased_at,
        prospect: prospect ? {
          name: `${prospect.firstName || ''} ${prospect.lastName || ''}`.trim() || prospect.email,
          email: prospect.email
        } : (c.prospect_email ? { email: c.prospect_email, name: c.prospect_email } : null),
        purchaseDetails: c.purchase_details ? {
          grossAmount: c.purchase_details.gross_amount,
          referralBonusApplied: c.purchase_details.referral_bonus_applied,
          netAmount: c.purchase_details.net_amount,
          referrerReward: c.purchase_details.referrer_reward
        } : null,
        referrerReward: c.referrer_reward ? {
          type: c.referrer_reward.type,
          amount: c.referrer_reward.amount,
          status: c.referrer_reward.status
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      referrals: formattedConversions
    });

  } catch (error) {
    console.error('Customer referrals list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading your referral list.' },
      { status: 500 }
    );
  }
}
