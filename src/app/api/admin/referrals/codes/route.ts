import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralCode from '@/features/shared/model/referral-code';
import User from '@/features/shared/model/user';
import ReferralConversion from '@/features/shared/model/referral-conversion';

interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// GET all referral codes (with details and stats)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get('status') || 'all'; // 'all', 'active', 'inactive'
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filterStatus === 'active') {
      query.is_active = true;
    } else if (filterStatus === 'inactive') {
      query.is_active = false;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.code = searchRegex;
    }

    const total = await ReferralCode.countDocuments(query);
    const codes = await ReferralCode.find(query)
      .populate('referrer_id', 'firstName lastName email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Enrich with dynamic usage stats
    const enrichedCodes = await Promise.all(codes.map(async (c) => {
      const clicks = await ReferralConversion.countDocuments({
        referral_code: c.code
      });

      const signups = await ReferralConversion.countDocuments({
        referral_code: c.code,
        conversion_stage: { $in: ['signed_up', 'purchased'] }
      });

      const purchasesDoc = await ReferralConversion.find({
        referral_code: c.code,
        conversion_stage: 'purchased'
      });

      const purchases = purchasesDoc.length;
      
      const revenue = purchasesDoc.reduce(
        (sum, doc) => sum + (doc.purchase_details?.net_amount || 0), 
        0
      );

      const referrer = c.referrer_id as unknown as PopulatedUser;

      return {
        _id: c._id,
        code: c.code,
        is_active: c.is_active,
        expires_at: c.expires_at,
        created_at: c.created_at,
        reward: c.reward,
        referrer: referrer ? {
          _id: referrer._id,
          name: `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || referrer.email,
          email: referrer.email
        } : null,
        stats: {
          clicks,
          signups,
          purchases,
          revenue
        }
      };
    }));

    return NextResponse.json({
      success: true,
      codes: enrichedCodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin get codes error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while listing referral codes.' },
      { status: 500 }
    );
  }
}

// POST create a referral code
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { code, referrerEmail, expiresAt, reward } = body;

    if (!code || !referrerEmail) {
      return NextResponse.json({ error: 'Referral code and referrer email are required.' }, { status: 400 });
    }

    await connectDB();

    // Check if code already exists
    const uppercaseCode = code.trim().toUpperCase();
    const existingCode = await ReferralCode.findOne({ code: uppercaseCode });
    if (existingCode) {
      return NextResponse.json({ error: `Referral code "${uppercaseCode}" already exists.` }, { status: 400 });
    }

    // Find referrer
    const referrerUser = await User.findOne({ email: referrerEmail.toLowerCase().trim() });
    if (!referrerUser) {
      return NextResponse.json({ error: `User with email "${referrerEmail}" not found.` }, { status: 404 });
    }

    // Create referral code
    const newCode = await ReferralCode.create({
      code: uppercaseCode,
      referrer_id: referrerUser._id,
      is_active: true,
      expires_at: expiresAt ? new Date(expiresAt) : undefined,
      reward: {
        type: reward?.type || 'cash',
        cashAmount: reward?.cashAmount || 1000,
        subscriptionMonths: reward?.subscriptionMonths || 3,
        referralBonus: reward?.referralBonus || 500
      }
    });

    // Update referrer user's referral code field
    referrerUser.referralCode = uppercaseCode;
    await referrerUser.save();

    return NextResponse.json({
      success: true,
      message: `Referral code "${uppercaseCode}" created successfully.`,
      code: newCode
    }, { status: 201 });

  } catch (error) {
    console.error('Admin create code error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating code.' },
      { status: 500 }
    );
  }
}
