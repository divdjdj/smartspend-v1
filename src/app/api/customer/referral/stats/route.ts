import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    // 1. Fetch total counts across conversion funnel stages for this referrer
    const clicks = await ReferralConversion.countDocuments({ 
      referrer_id: session.user.id,
      conversion_stage: { $in: ['clicked', 'visited', 'signed_up', 'purchased'] }
    });

    const signups = await ReferralConversion.countDocuments({ 
      referrer_id: session.user.id,
      conversion_stage: { $in: ['signed_up', 'purchased'] }
    });

    const purchases = await ReferralConversion.countDocuments({ 
      referrer_id: session.user.id,
      conversion_stage: 'purchased'
    });

    // 2. Fetch or initialize the reward ledger
    const ledger = await getOrCreateRewardLedger(session.user.id);

    // Calculate sum of completed cash redemptions
    const claimedCash = ledger.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingCash = ledger.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    // E.g. available balance = total_earned - claimed - pending
    const availableBalance = Math.max(0, ledger.cash_earned - claimedCash - pendingCash);

    return NextResponse.json({
      success: true,
      stats: {
        clicks,
        signups,
        purchases,
        totalEarnings: ledger.total_earned,
        cashEarned: ledger.cash_earned,
        availableBalance,
        claimedCash,
        pendingCash,
        subscriptionMonths: ledger.subscription_months,
        preferredRewardType: ledger.preferred_reward_type
      }
    });

  } catch (error) {
    console.error('Customer referral stats error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching referral statistics.' },
      { status: 500 }
    );
  }
}
