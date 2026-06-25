import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralReward from '@/features/shared/model/referral-reward';
import User from '@/features/shared/model/user';
import { sendReferralEmail } from '@/lib/mail';

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

    const user = await User.findById(customerId);
    if (user) {
      // Send Email Notification
      await sendReferralEmail(
        user.email,
        'Your withdrawal claim request was rejected',
        `<p>Hello,</p><p>We regret to inform you that your cash claim request for <strong>₹${redemption.amount || 0}</strong> has been rejected by our administration team.</p><p>Reason: <em>${reason || 'Self-referral or mismatch flagged during transaction review.'}</em></p>`
      );
    }

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
