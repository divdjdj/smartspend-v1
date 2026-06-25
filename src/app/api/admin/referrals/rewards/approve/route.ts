import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralReward from '@/features/shared/model/referral-reward';
import { processPayoutTransfer } from '@/features/shared/services/payout';
import { sendReferralEmail } from '@/lib/mail';
import { createNotification } from '@/lib/notification';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { customerId, redemptionId } = await req.json();

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

    const user = await User.findById(customerId);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Process based on type
    if (redemption.type === 'cash_claim') {
      // Execute payout transfer via payment gateway
      const payoutResult = await processPayoutTransfer(user.email, redemption.amount);
      if (!payoutResult.success) {
        return NextResponse.json({ error: payoutResult.error || 'Failed to process cash payout transfer.' }, { status: 500 });
      }

      // Credit to user's account balance
      user.accountBalance = (user.accountBalance || 0) + redemption.amount;
      await user.save();

      // Send Email Notification
      await sendReferralEmail(
        user.email,
        'Your cash reward claim has been approved!',
        `<p>Hello,</p><p>Great news! Administrative review is complete and your cash withdrawal of <strong>₹${redemption.amount}</strong> has been approved.</p><p>Transfer ID: <code>${payoutResult.transferId}</code>.</p>`
      );

      // Trigger in-app notification
      await createNotification({
        recipientId: user._id,
        title: 'Cash Payout Approved! 💸',
        message: `Your cash claim request of ₹${redemption.amount} has been approved and credited to your wallet balance.`,
        type: 'reward',
        actionUrl: '/client/referral'
      });
    } else if (redemption.type === 'subscription_activation') {
      // Find and extend active subscription
      const activeSubs = user.subscriptions.filter(s => s.status === 'active' && s.endDate > new Date());
      if (activeSubs.length === 0) {
        return NextResponse.json({ error: 'Customer does not have an active subscription to extend. Please extend manually or request customer to purchase a plan.' }, { status: 400 });
      }
      
      const sub = activeSubs[0];
      const currentEnd = new Date(sub.endDate);
      sub.endDate = new Date(currentEnd.setMonth(currentEnd.getMonth() + redemption.months));
      await user.save();

      // Send Email Notification
      await sendReferralEmail(
        user.email,
        'Your subscription extension has been approved!',
        `<p>Hello,</p><p>Great news! Administrative review is complete and your subscription extension of <strong>${redemption.months} free months</strong> has been applied to your <strong>${sub.packageName}</strong> subscription.</p>`
      );

      // Trigger in-app notification
      await createNotification({
        recipientId: user._id,
        title: 'Subscription Extended! 💳',
        message: `Your subscription extension of ${redemption.months} free months has been applied to ${sub.packageName}.`,
        type: 'subscription',
        actionUrl: '/client/dashboard'
      });
    }

    // Update redemption status
    redemption.status = 'completed';
    await ledger.save();

    return NextResponse.json({
      success: true,
      message: 'Redemption request approved and completed successfully.'
    });

  } catch (error) {
    console.error('Admin approve reward error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while approving reward request.' },
      { status: 500 }
    );
  }
}
