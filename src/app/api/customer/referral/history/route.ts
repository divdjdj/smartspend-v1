import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';

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

    const ledger = await getOrCreateRewardLedger(session.user.id);

    // 1. Fetch conversions that yielded rewards
    const conversions = await ReferralConversion.find({
      referrer_id: session.user.id,
      conversion_stage: 'purchased',
      'referrer_reward.amount': { $gt: 0 }
    }).populate('prospect_id', 'firstName lastName email');

    // 2. Format Earnings
    const earningsHistory = conversions.map(c => {
      const prospect = c.prospect_id as unknown as PopulatedUser;
      const prospectName = prospect 
        ? `${prospect.firstName || ''} ${prospect.lastName || ''}`.trim() || prospect.email
        : c.prospect_email || 'Referred User';
      
      const type = c.referrer_reward?.type === 'subscription' 
        ? 'Subscription Earned' 
        : 'Cash Earned';
      
      const details = c.referrer_reward?.type === 'subscription'
        ? `Referred ${prospectName} (3 Months Free)`
        : `Referred ${prospectName} (₹${c.referrer_reward?.amount})`;

      return {
        date: c.timeline.purchased_at || c.createdAt || new Date(),
        type,
        details,
        amount: c.referrer_reward?.amount || 0,
        months: c.referrer_reward?.type === 'subscription' ? 3 : 0,
        status: 'completed'
      };
    });

    // 3. Format Redemptions / Claims
    const redemptionsHistory = ledger.redemptions.map(r => {
      const type = r.type === 'cash_claim' ? 'Cash Claimed' : 'Subscription Applied';
      const details = r.type === 'cash_claim'
        ? `Withdrawn to account balance (₹${r.amount})`
        : `Applied ${r.months} Months extension to active subscription`;

      return {
        date: r.created_at || new Date(),
        type,
        details,
        amount: r.amount,
        months: r.months,
        status: r.status
      };
    });

    // 4. Combine and Sort by date descending
    const history = [...earningsHistory, ...redemptionsHistory].sort(
      (a, b) => new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime()
    );

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Customer history route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading your history ledger.' },
      { status: 500 }
    );
  }
}
