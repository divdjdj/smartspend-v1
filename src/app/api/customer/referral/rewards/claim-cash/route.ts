import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import { getReferralSettings } from '@/features/shared/model/referral-setting';
import { processPayoutTransfer } from '@/features/shared/services/payout';
import { sendReferralEmail } from '@/lib/mail';
import { createNotification } from '@/lib/notification';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { amount } = await req.json();
    const claimAmount = parseFloat(amount);

    if (isNaN(claimAmount) || claimAmount <= 0) {
      return NextResponse.json({ error: 'Please specify a valid positive amount to claim.' }, { status: 400 });
    }

    await connectDB();

    const ledger = await getOrCreateRewardLedger(session.user.id);

    // Calculate available balance
    const claimedCash = ledger.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingCash = ledger.redemptions
      .filter(r => r.type === 'cash_claim' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    const availableBalance = Math.max(0, ledger.cash_earned - claimedCash - pendingCash);

    if (claimAmount > availableBalance) {
      return NextResponse.json({ error: `Insufficient cash balance. Available: ₹${availableBalance}` }, { status: 400 });
    }

    const settings = await getReferralSettings();
    const autoCredit = settings.auto_credit_cash;

    if (autoCredit) {
      // Auto credit directly to the customer's account balance
      const user = await User.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
      }

      // Execute Payout Transfer via payment gateway
      const payoutResult = await processPayoutTransfer(user.email, claimAmount);
      if (!payoutResult.success) {
        return NextResponse.json({ error: payoutResult.error || 'Failed to process cash payout transfer.' }, { status: 500 });
      }

      user.accountBalance = (user.accountBalance || 0) + claimAmount;
      await user.save();

      // Add to redemptions as completed
      ledger.redemptions.push({
        type: 'cash_claim',
        amount: claimAmount,
        months: 0,
        status: 'completed',
        created_at: new Date()
      });
      await ledger.save();

      // Send Email Notification
      await sendReferralEmail(
        user.email,
        'Your cash reward payout has been completed!',
        `<p>Hello,</p><p>We have successfully processed your withdrawal request of <strong>₹${claimAmount}</strong>.</p><p>The cash has been disbursed to your account balance. Transfer ID: <code>${payoutResult.transferId}</code>.</p>`
      );

      // Trigger in-app notifications
      try {
        await createNotification({
          recipientId: user._id,
          title: 'Cash Reward Disbursed! 💸',
          message: `Your cash withdrawal claim of ₹${claimAmount} was completed successfully (Auto-credited to balance).`,
          type: 'reward',
          actionUrl: '/client/referral'
        });

        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await createNotification({
            recipientId: admin._id,
            title: 'Cash Payout Processed (Auto)',
            message: `${user.fullName || user.email} claimed and received ₹${claimAmount} automatically.`,
            type: 'reward',
            actionUrl: '/admin/referral'
          });
        }
      } catch (notifErr) {
        console.error('Error triggering auto claim in-app notifications:', notifErr);
      }

      return NextResponse.json({
        success: true,
        status: 'completed',
        message: `Successfully claimed ₹${claimAmount}. It has been auto-credited to your account balance!`
      });
    } else {
      const user = await User.findById(session.user.id);

      // Mark as pending for admin approval
      ledger.redemptions.push({
        type: 'cash_claim',
        amount: claimAmount,
        months: 0,
        status: 'pending',
        created_at: new Date()
      });
      await ledger.save();

      if (user) {
        await sendReferralEmail(
          user.email,
          'Your cash claim request has been submitted',
          `<p>Hello,</p><p>Your withdrawal claim request for <strong>₹${claimAmount}</strong> has been submitted. It is now awaiting administrative approval.</p>`
        );

        // Trigger in-app notifications
        try {
          await createNotification({
            recipientId: user._id,
            title: 'Cash Claim Submitted ⏳',
            message: `Your withdrawal request of ₹${claimAmount} has been submitted for administrative review.`,
            type: 'reward',
            actionUrl: '/client/referral'
          });

          const admins = await User.find({ role: 'admin' });
          for (const admin of admins) {
            await createNotification({
              recipientId: admin._id,
              title: 'New Cash Claim Request',
              message: `${user.fullName || user.email} requested a cash payout of ₹${claimAmount}.`,
              type: 'reward',
              actionUrl: '/admin/referral'
            });
          }
        } catch (notifErr) {
          console.error('Error triggering pending claim in-app notifications:', notifErr);
        }
      }

      return NextResponse.json({
        success: true,
        status: 'pending',
        message: `Claim request for ₹${claimAmount} submitted. Awaiting administrative approval.`
      });
    }

  } catch (error) {
    console.error('Customer claim cash reward error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while claiming your reward.' },
      { status: 500 }
    );
  }
}
