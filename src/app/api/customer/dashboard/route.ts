import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralReward from '@/features/shared/model/referral-reward';
import ReferralConversion from '@/features/shared/model/referral-conversion';

export async function GET() {
  try {
    // 1. Authenticate session and check user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    // 2. Connect to database
    await connectDB();

    // 3. Fetch user profile
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 4. Determine active plan
    const now = new Date();
    const activeSub = user.subscriptions
      .filter(s => s.status === 'active' && new Date(s.endDate) > now)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0] || null;

    // Days remaining on active plan
    let daysRemaining = 0;
    if (activeSub) {
      const diffTime = new Date(activeSub.endDate).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // 5. Fetch referral reward ledger
    const ledger = await ReferralReward.findOne({ customer_id: user._id });
    const cashEarned = ledger?.cash_earned || 0;

    const claimedCash = ledger?.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0) || 0;

    const pendingCash = ledger?.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0) || 0;

    const walletBalance = Math.max(0, cashEarned - claimedCash - pendingCash);

    // 6. Referral checklist and details
    const referredCount = await User.countDocuments({
      'referredBy.referrerId': user._id
    });

    const recentConversions = await ReferralConversion.find({ referrer_id: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Format subscription transaction history
    const billingHistory = user.subscriptions
      .slice()
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return NextResponse.json({
      success: true,
      profile: {
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode || '',
        accountBalance: user.accountBalance || 0,
        createdAt: user.get('createdAt')
      },
      stats: {
        activePlanName: activeSub ? activeSub.packageName : 'No Active Plan',
        daysRemaining,
        walletBalance,
        referredCount
      },
      activeSubscription: activeSub,
      conversions: recentConversions,
      billingHistory
    });

  } catch (error) {
    console.error('Customer dashboard stats error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading dashboard.' },
      { status: 500 }
    );
  }
}
