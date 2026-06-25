import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import User from '@/features/shared/model/user';
import ReferralConversion from '@/features/shared/model/referral-conversion';

export async function GET(req: Request, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { customerId } = await params;

    await connectDB();

    const user = await User.findById(customerId);
    if (!user) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    const ledger = await getOrCreateRewardLedger(customerId);

    // Fetch transactions
    const conversions = await ReferralConversion.find({
      referrer_id: customerId,
      conversion_stage: 'purchased'
    }).populate('prospect_id', 'firstName lastName email');

    const earnings = conversions.map(c => {
      const prospect = c.prospect_id as any;
      return {
        _id: c._id,
        date: c.timeline.purchased_at || c.createdAt || new Date(),
        type: 'earned',
        rewardType: c.referrer_reward?.type || 'cash',
        amount: c.referrer_reward?.amount || 0,
        status: c.referrer_reward?.status || 'calculated',
        details: `Referred ${prospect ? `${prospect.firstName || ''} ${prospect.lastName || ''}`.trim() : c.prospect_email}`
      };
    });

    const claims = ledger.redemptions.map(r => ({
      _id: r._id,
      date: r.created_at || new Date(),
      type: 'claimed',
      rewardType: r.type === 'cash_claim' ? 'cash' : 'subscription',
      amount: r.type === 'cash_claim' ? r.amount : r.months,
      status: r.status,
      details: r.type === 'cash_claim' ? 'Withdrawn cash claim' : 'Applied subscription months'
    }));

    const transactions = [...earnings, ...claims].sort(
      (a, b) => new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime()
    );

    return NextResponse.json({
      success: true,
      customer: {
        name: user.fullName,
        email: user.email,
        referralCode: user.referralCode
      },
      ledger: {
        totalEarned: ledger.total_earned,
        cashEarned: ledger.cash_earned,
        subscriptionMonths: ledger.subscription_months,
        preferredRewardType: ledger.preferred_reward_type
      },
      transactions
    });

  } catch (error) {
    console.error('Admin get customer rewards ledger error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading customer reward ledger.' },
      { status: 500 }
    );
  }
}
