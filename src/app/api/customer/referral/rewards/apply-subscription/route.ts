import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import { getReferralSettings } from '@/features/shared/model/referral-setting';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { subscriptionId, months } = await req.json();
    const applyMonths = parseInt(months, 10);

    if (isNaN(applyMonths) || applyMonths <= 0) {
      return NextResponse.json({ error: 'Please specify a valid number of free months to apply.' }, { status: 400 });
    }

    await connectDB();

    const ledger = await getOrCreateRewardLedger(session.user.id);

    // Calculate applied months
    const appliedMonths = ledger.redemptions
      .filter(r => r.type === 'subscription_activation' && r.status === 'completed')
      .reduce((sum, r) => sum + r.months, 0);

    const pendingMonths = ledger.redemptions
      .filter(r => r.type === 'subscription_activation' && r.status === 'pending')
      .reduce((sum, r) => sum + r.months, 0);

    const availableMonths = Math.max(0, ledger.subscription_months - appliedMonths - pendingMonths);

    if (applyMonths > availableMonths) {
      return NextResponse.json({ error: `Insufficient free months balance. Available: ${availableMonths} months.` }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Find the target subscription
    const sub = user.subscriptions.find(s => s._id?.toString() === subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: 'Selected subscription not found in your account.' }, { status: 404 });
    }

    if (sub.status !== 'active') {
      return NextResponse.json({ error: 'Subscription is not active and cannot be extended.' }, { status: 400 });
    }

    const settings = await getReferralSettings();
    const autoApply = settings.auto_apply_subscription;

    if (autoApply) {
      // Instantly extend subscription end date by the specified months
      const currentEnd = new Date(sub.endDate);
      const newEnd = new Date(currentEnd.setMonth(currentEnd.getMonth() + applyMonths));
      sub.endDate = newEnd;
      
      await user.save();

      // Log in ledger redemptions as completed
      ledger.redemptions.push({
        type: 'subscription_activation',
        amount: 0,
        months: applyMonths,
        status: 'completed',
        created_at: new Date()
      });
      await ledger.save();

      return NextResponse.json({
        success: true,
        status: 'completed',
        message: `Successfully extended your ${sub.packageName} subscription by ${applyMonths} Months!`
      });
    } else {
      // Add as pending admin action
      ledger.redemptions.push({
        type: 'subscription_activation',
        amount: 0,
        months: applyMonths,
        status: 'pending',
        created_at: new Date()
      });
      await ledger.save();

      return NextResponse.json({
        success: true,
        status: 'pending',
        message: `Application request for ${applyMonths} free months submitted. Awaiting administrative approval.`
      });
    }

  } catch (error) {
    console.error('Customer apply subscription free months error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while applying subscription extension.' },
      { status: 500 }
    );
  }
}
