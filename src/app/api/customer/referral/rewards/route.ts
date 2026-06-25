import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import User from '@/features/shared/model/user';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const ledger = await getOrCreateRewardLedger(session.user.id);
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const activeSubscriptions = user.subscriptions
      .filter(s => s.status === 'active' && s.endDate > new Date())
      .map(s => ({
        _id: s._id,
        packageName: s.packageName,
        endDate: s.endDate
      }));

    const claimedCash = ledger.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingCash = ledger.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    const availableBalance = Math.max(0, ledger.cash_earned - claimedCash - pendingCash);

    return NextResponse.json({
      success: true,
      ledger: {
        totalEarned: ledger.total_earned,
        cashEarned: ledger.cash_earned,
        availableBalance,
        claimedCash,
        pendingCash,
        subscriptionMonths: ledger.subscription_months,
        preferredRewardType: ledger.preferred_reward_type
      },
      activeSubscriptions
    });

  } catch (error) {
    console.error('Customer rewards route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching rewards overview.' },
      { status: 500 }
    );
  }
}
