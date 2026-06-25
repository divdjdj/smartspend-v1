import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import ReferralReward, { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import { getReferralSettings } from '@/features/shared/model/referral-setting';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { packageName, grossAmount } = await req.json();
    const originalPrice = parseFloat(grossAmount);

    if (!packageName || isNaN(originalPrice) || originalPrice <= 0) {
      return NextResponse.json({ error: 'Package name and valid original price are required.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Determine if first purchase
    const isFirstPurchase = user.subscriptions.length === 0;

    let discountApplied = 0;
    let netAmount = originalPrice;
    let referralApplied = false;
    let referrerId = user.referredBy?.referrerId;

    // Check if referred by someone and it is their first purchase
    if (referrerId && isFirstPurchase) {
      const settings = await getReferralSettings();
      discountApplied = settings.referral_bonus_amount || 500;
      netAmount = Math.max(0, originalPrice - discountApplied);
      referralApplied = true;
    }

    // Add subscription to user
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30-day subscription for simulation

    user.subscriptions.push({
      packageId: packageName.toLowerCase().replace(/\s+/g, '-'),
      packageName,
      billingCycle: 'monthly',
      price: originalPrice,
      discount: discountApplied,
      totalPrice: netAmount,
      status: 'active',
      startDate: new Date(),
      endDate
    });

    await user.save();

    // Process referrer reward if referral was applied
    if (referralApplied && referrerId) {
      try {
        const settings = await getReferralSettings();
        const referrerUser = await User.findById(referrerId);

        if (referrerUser) {
          // Find referrer's active referral code
          const refCodeDoc = await ReferralCode.findOne({ referrer_id: referrerId, is_active: true });
          const rewardType = refCodeDoc?.reward.type || 'cash';
          
          let rewardAmount = 0;
          let rewardMonths = 0;

          if (rewardType === 'cash') {
            // Apply ₹1,000 if netAmount >= ₹4,000 threshold, else ₹500
            const minPurchase = settings.min_purchase_for_reward || 4000;
            const highReward = settings.cash_reward_high || 1000;
            const lowReward = settings.cash_reward_low || 500;
            
            rewardAmount = netAmount >= minPurchase ? highReward : lowReward;
          } else {
            // Apply 3 Months Free
            rewardMonths = settings.subscription_months || 3;
          }

          // Fetch referrer ledger
          const ledger = await getOrCreateRewardLedger(referrerId);

          // Update ledger
          if (rewardType === 'cash') {
            ledger.cash_earned += rewardAmount;
            ledger.total_earned += rewardAmount;

            if (settings.auto_credit_cash) {
              referrerUser.accountBalance = (referrerUser.accountBalance || 0) + rewardAmount;
              await referrerUser.save();
            }
          } else {
            ledger.subscription_months += rewardMonths;
            // Let's attribute nominal monetary value for analytics: e.g. ₹1,500 value for 3 months
            ledger.total_earned += (rewardMonths * 500); 

            if (settings.auto_apply_subscription) {
              // Automatically extend referrer's active subscription if they have one
              const activeSubs = referrerUser.subscriptions.filter(s => s.status === 'active' && s.endDate > new Date());
              if (activeSubs.length > 0) {
                // Extend the first active subscription
                const subToExtend = activeSubs[0];
                const currentEnd = new Date(subToExtend.endDate);
                subToExtend.endDate = new Date(currentEnd.setMonth(currentEnd.getMonth() + rewardMonths));
                await referrerUser.save();

                // Add to redemptions as auto-completed
                ledger.redemptions.push({
                  type: 'subscription_activation',
                  amount: 0,
                  months: rewardMonths,
                  status: 'completed',
                  created_at: new Date()
                });
              }
            }
          }

          await ledger.save();

          // Update conversion log to "purchased"
          const codeString = refCodeDoc ? refCodeDoc.code : (referrerUser.referralCode || 'REFERRAL');
          let conversion = await ReferralConversion.findOne({
            referrer_id: referrerId,
            prospect_id: user._id
          });

          if (!conversion) {
            conversion = await ReferralConversion.findOne({
              referrer_id: referrerId,
              conversion_stage: 'signed_up',
              prospect_email: user.email
            });
          }

          const statusVal = (rewardType === 'cash' && settings.auto_credit_cash) || 
                            (rewardType === 'subscription' && settings.auto_apply_subscription)
                            ? 'credited' : 'calculated';

          if (conversion) {
            conversion.conversion_stage = 'purchased';
            conversion.timeline.purchased_at = new Date();
            conversion.purchase_details = {
              gross_amount: originalPrice,
              referral_bonus_applied: discountApplied,
              net_amount: netAmount,
              referrer_reward: rewardType === 'cash' ? rewardAmount : rewardMonths
            };
            conversion.referrer_reward = {
              type: rewardType,
              amount: rewardType === 'cash' ? rewardAmount : rewardMonths,
              status: statusVal
            };
            await conversion.save();
          } else {
            await ReferralConversion.create({
              referral_code: codeString,
              referrer_id: referrerId,
              prospect_id: user._id,
              prospect_email: user.email,
              conversion_stage: 'purchased',
              timeline: {
                clicked_at: new Date(),
                signed_up_at: new Date(),
                purchased_at: new Date()
              },
              purchase_details: {
                gross_amount: originalPrice,
                referral_bonus_applied: discountApplied,
                net_amount: netAmount,
                referrer_reward: rewardType === 'cash' ? rewardAmount : rewardMonths
              },
              referrer_reward: {
                type: rewardType,
                amount: rewardType === 'cash' ? rewardAmount : rewardMonths,
                status: statusVal
              }
            });
          }

          // Mock sending email notification by logging to console
          console.log('\n========================================');
          console.log(`[DEV EMAIL] Referral Purchase Reward Credited!`);
          console.log(`Referrer: ${referrerUser.email} has earned a reward!`);
          console.log(`Reward details: ${rewardType === 'cash' ? `₹${rewardAmount} Cash` : `${rewardMonths} Free Subscription Months`}`);
          console.log(`Prospect email: ${user.email} completed purchase of ${packageName}`);
          console.log('========================================\n');
        }
      } catch (refErr) {
        console.error('Error processing referrer reward during simulated purchase:', refErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Simulated purchase of ${packageName} successful!`,
      details: {
        packageName,
        grossAmount: originalPrice,
        discountApplied,
        netAmount,
        referralApplied,
        activeSubscriptionsCount: user.subscriptions.length
      }
    });

  } catch (error) {
    console.error('Simulator purchase API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during the simulated purchase.' },
      { status: 500 }
    );
  }
}
