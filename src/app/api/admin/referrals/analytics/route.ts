import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import ReferralReward from '@/features/shared/model/referral-reward';
import User from '@/features/shared/model/user';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    // 1. KPI Counts
    const activeCodesCount = await ReferralCode.countDocuments({ is_active: true });
    
    const clicksCount = await ReferralConversion.countDocuments();
    
    const signupsCount = await ReferralConversion.countDocuments({
      conversion_stage: { $in: ['signed_up', 'purchased'] }
    });

    const purchasesCount = await ReferralConversion.countDocuments({
      conversion_stage: 'purchased'
    });

    // Sum total revenue
    const revenueAggregation = await ReferralConversion.aggregate([
      { $match: { conversion_stage: 'purchased' } },
      { $group: { _id: null, total: { $sum: '$purchase_details.net_amount' } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.total || 0;

    // Sum total cash paid and months given from ledgers
    const ledgerAgg = await ReferralReward.aggregate([
      {
        $group: {
          _id: null,
          totalEarned: { $sum: '$total_earned' },
          totalCashEarned: { $sum: '$cash_earned' },
          totalMonthsEarned: { $sum: '$subscription_months' }
        }
      }
    ]);

    const totalCashPaid = ledgerAgg[0]?.totalCashEarned || 0;
    const totalSubMonths = ledgerAgg[0]?.totalMonthsEarned || 0;

    // 2. Top Referrers Leaderboard
    const topReferrersRaw = await ReferralReward.find({})
      .populate('customer_id', 'firstName lastName email referralCode')
      .sort({ total_earned: -1 })
      .limit(5);

    const leaderboard = await Promise.all(topReferrersRaw.map(async (ledger) => {
      const customer = ledger.customer_id as any;
      
      // Calculate conversion rate: purchases / clicks
      const clicks = await ReferralConversion.countDocuments({ referrer_id: ledger.customer_id });
      const purchases = await ReferralConversion.countDocuments({ 
        referrer_id: ledger.customer_id, 
        conversion_stage: 'purchased' 
      });

      const conversionRate = clicks > 0 ? parseFloat(((purchases / clicks) * 100).toFixed(1)) : 0;

      return {
        referrerId: customer?._id || ledger.customer_id,
        name: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email : 'Unknown Referrer',
        email: customer?.email || '',
        referralCode: customer?.referralCode || 'REF',
        earnings: ledger.total_earned,
        conversionsCount: purchases,
        conversionRate
      };
    }));

    // 3. Recent Conversions (Last 10)
    const recentConversions = await ReferralConversion.find({ conversion_stage: 'purchased' })
      .populate('referrer_id', 'firstName lastName email')
      .populate('prospect_id', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .limit(10);

    const formattedRecent = recentConversions.map(c => {
      const referrer = c.referrer_id as any;
      const prospect = c.prospect_id as any;
      return {
        _id: c._id,
        referralCode: c.referral_code,
        purchasedAt: c.timeline.purchased_at || c.updatedAt,
        amount: c.purchase_details?.net_amount || 0,
        referrerReward: c.referrer_reward?.amount || 0,
        referrerRewardType: c.referrer_reward?.type || 'cash',
        referrerName: referrer ? `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || referrer.email : 'Referrer',
        prospectName: prospect ? `${prospect.firstName || ''} ${prospect.lastName || ''}`.trim() || prospect.email : c.prospect_email || 'Prospect'
      };
    });

    return NextResponse.json({
      success: true,
      kpis: {
        activeCodes: activeCodesCount,
        clicks: clicksCount,
        signups: signupsCount,
        purchases: purchasesCount,
        revenue: totalRevenue,
        cashPaid: totalCashPaid,
        subscriptionMonths: totalSubMonths
      },
      leaderboard,
      recentConversions: formattedRecent
    });

  } catch (error) {
    console.error('Admin get analytics error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching analytics statistics.' },
      { status: 500 }
    );
  }
}
