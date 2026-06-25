import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralReward from '@/features/shared/model/referral-reward';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { customerId, redemptionId, reason } = await req.json();

    if (!customerId || !redemptionId) {
      return NextResponse.json({ error: 'Customer ID and Redemption ID are required.' }, { status: 400 });
    }

    await connectDB();

    const ledger = await ReferralReward.findOne({ customer_id: customerId });
    if (!ledger) {
      return NextResponse.json({ error: 'Reward ledger not found.' }, { status: 404 });
    }

    // Find redemption
    const redemption = ledger.redemptions.find(r => r._id?.toString() === redemptionId);
    if (!redemption) {
      return NextResponse.json({ error: 'Redemption record not found.' }, { status: 404 });
    }

    if (redemption.status !== 'pending') {
      return NextResponse.json({ error: `Redemption is already in "${redemption.status}" status.` }, { status: 400 });
    }

    // Update status to failed (rejected)
    redemption.status = 'failed';
    await ledger.save();

    console.log(`[ADMIN ACTION] Redemption rejected for customer ${customerId}. Reason: ${reason || 'No reason provided'}`);

    return NextResponse.json({
      success: true,
      message: 'Redemption request has been rejected.'
    });

  } catch (error) {
    console.error('Admin reject reward error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while rejecting reward request.' },
      { status: 500 }
    );
  }
}
