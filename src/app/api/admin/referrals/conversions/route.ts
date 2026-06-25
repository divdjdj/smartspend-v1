import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import User from '@/features/shared/model/user';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const filterStage = searchParams.get('stage') || 'all'; // 'all', 'clicked', 'signed_up', 'purchased', 'cancelled'
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filterStage !== 'all') {
      query.conversion_stage = filterStage;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { referral_code: searchRegex },
        { prospect_email: searchRegex }
      ];
    }

    const total = await ReferralConversion.countDocuments(query);
    
    const conversions = await ReferralConversion.find(query)
      .populate('referrer_id', 'firstName lastName email')
      .populate('prospect_id', 'firstName lastName email status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format list for frontend
    const formattedConversions = conversions.map(c => {
      const referrer = c.referrer_id as any;
      const prospect = c.prospect_id as any;

      return {
        _id: c._id,
        referralCode: c.referral_code,
        conversionStage: c.conversion_stage,
        timeline: c.timeline,
        metadata: c.metadata,
        purchaseDetails: c.purchase_details,
        referrerReward: c.referrer_reward,
        isFlagged: c.is_flagged,
        flagReason: c.flag_reason,
        createdAt: c.createdAt,
        referrer: referrer ? {
          name: `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || referrer.email,
          email: referrer.email
        } : null,
        prospect: prospect ? {
          name: `${prospect.firstName || ''} ${prospect.lastName || ''}`.trim() || prospect.email,
          email: prospect.email
        } : (c.prospect_email ? { email: c.prospect_email, name: c.prospect_email } : null)
      };
    });

    return NextResponse.json({
      success: true,
      conversions: formattedConversions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin get conversions error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while listing conversions.' },
      { status: 500 }
    );
  }
}
