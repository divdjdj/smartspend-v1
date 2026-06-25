import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import User from '@/features/shared/model/user';

// GET code details + its conversion history
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const codeDoc = await ReferralCode.findById(id).populate('referrer_id', 'firstName lastName email');
    if (!codeDoc) {
      return NextResponse.json({ error: 'Referral code not found.' }, { status: 404 });
    }

    // Get conversions for this code
    const conversions = await ReferralConversion.find({ referral_code: codeDoc.code })
      .populate('prospect_id', 'firstName lastName email status')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      code: codeDoc,
      conversions
    });

  } catch (error) {
    console.error('Admin get code detail error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching code details.' },
      { status: 500 }
    );
  }
}

// PATCH update code configuration
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { is_active, expires_at, reward } = body;

    await connectDB();

    const codeDoc = await ReferralCode.findById(id);
    if (!codeDoc) {
      return NextResponse.json({ error: 'Referral code not found.' }, { status: 404 });
    }

    if (is_active !== undefined) codeDoc.is_active = is_active;
    if (expires_at !== undefined) codeDoc.expires_at = expires_at ? new Date(expires_at) : undefined;
    
    if (reward) {
      if (reward.type !== undefined) codeDoc.reward.type = reward.type;
      if (reward.cashAmount !== undefined) codeDoc.reward.cashAmount = reward.cashAmount;
      if (reward.subscriptionMonths !== undefined) codeDoc.reward.subscriptionMonths = reward.subscriptionMonths;
      if (reward.referralBonus !== undefined) codeDoc.reward.referralBonus = reward.referralBonus;
    }

    await codeDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Referral code updated successfully.',
      code: codeDoc
    });

  } catch (error) {
    console.error('Admin patch code error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating referral code.' },
      { status: 500 }
    );
  }
}

// DELETE code
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const codeDoc = await ReferralCode.findById(id);
    if (!codeDoc) {
      return NextResponse.json({ error: 'Referral code not found.' }, { status: 404 });
    }

    // Unset the referralCode from the referrer user profile
    await User.findByIdAndUpdate(codeDoc.referrer_id, { $unset: { referralCode: 1 } });

    // Delete the code document
    await ReferralCode.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Referral code "${codeDoc.code}" deleted successfully.`
    });

  } catch (error) {
    console.error('Admin delete code error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting referral code.' },
      { status: 500 }
    );
  }
}
