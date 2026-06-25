import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ReferralSetting, { getReferralSettings } from '@/features/shared/model/referral-setting';

// GET global settings
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();
    const settings = await getReferralSettings();

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Admin get settings error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching referral settings.' },
      { status: 500 }
    );
  }
}

// PATCH update global settings
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();

    await connectDB();
    
    // Find settings or create if not exists
    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = new ReferralSetting({});
    }

    // Apply updates
    if (body.cash_reward_high !== undefined) settings.cash_reward_high = parseFloat(body.cash_reward_high);
    if (body.cash_reward_low !== undefined) settings.cash_reward_low = parseFloat(body.cash_reward_low);
    if (body.subscription_months !== undefined) settings.subscription_months = parseInt(body.subscription_months, 10);
    if (body.referral_bonus_amount !== undefined) settings.referral_bonus_amount = parseFloat(body.referral_bonus_amount);
    if (body.min_purchase_for_reward !== undefined) settings.min_purchase_for_reward = parseFloat(body.min_purchase_for_reward);
    
    if (body.auto_credit_cash !== undefined) settings.auto_credit_cash = !!body.auto_credit_cash;
    if (body.auto_apply_subscription !== undefined) settings.auto_apply_subscription = !!body.auto_apply_subscription;
    if (body.currency !== undefined) settings.currency = body.currency;

    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'Referral program settings updated successfully.',
      settings
    });

  } catch (error) {
    console.error('Admin patch settings error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating referral settings.' },
      { status: 500 }
    );
  }
}
