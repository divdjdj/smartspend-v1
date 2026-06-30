import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import { getOrCreateRewardLedger } from '@/features/shared/model/referral-reward';
import { getReferralSettings } from '@/features/shared/model/referral-setting';
import { sendReferralEmail } from '@/lib/mail';
import { createNotification } from '@/lib/notification';

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

    // Verify against a server-side catalog to prevent client pricing tampering
    const PACKAGE_PRICES: Record<string, number> = {
      'cursor pro': 4500,
      'chatgpt plus': 2500,
      'linkedin sales navigator': 6500,
      'linkedin sales nav': 6500 // fallback alias used in option value
    };

    const normalizedPackage = packageName.trim().toLowerCase();
    const expectedPrice = PACKAGE_PRICES[normalizedPackage];

    if (!expectedPrice) {
      return NextResponse.json({ error: `Invalid subscription package: "${packageName}"` }, { status: 400 });
    }

    if (originalPrice !== expectedPrice) {
      return NextResponse.json({ error: `Tampered checkout price for "${packageName}". Expected: ₹${expectedPrice}` }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Determine if first purchase

    const discountApplied = 0;
    const netAmount = originalPrice;
    const referralApplied = false;
    const referrerId = null; // Partners self-purchasing don't trigger referral rewards
    // Note: referral discounts are for clients (Client model), not for partners purchasing their own subscriptions

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

    // Trigger in-app notifications for buyer and admins
    try {
      await createNotification({
        recipientId: user._id,
        title: 'Subscription Activated! 💳',
        message: `Your subscription to ${packageName} is now active. Validity: ${new Date(endDate).toLocaleDateString('en-IN')}.`,
        type: 'subscription',
        actionUrl: '/partner/dashboard'
      });

      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          title: 'New Subscription Purchase 💰',
          message: `${user.fullName || user.email} purchased a subscription for ${packageName} (Net Paid: ₹${netAmount}).`,
          type: 'subscription',
          actionUrl: '/admin/clients'
        });
      }
    } catch (notifErr) {
      console.error('Error triggering purchase in-app notifications:', notifErr);
    }

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

          // Send real email notification via mail module pipeline
          const emailSubject = 'You earned a SpentSmart referral reward!';
          const emailHtml = `
            <p>Hello,</p>
            <p>Great news! Your friend <strong>${user.email}</strong> just completed a purchase of <strong>${packageName}</strong> using your referral link.</p>
            <p>You have earned: <strong>${rewardType === 'cash' ? `₹${rewardAmount} Cash` : `${rewardMonths} Free Months Extension`}</strong>.</p>
            <p>The reward has been credited directly to your account. Check your dashboard for details.</p>
          `;
          await sendReferralEmail(referrerUser.email, emailSubject, emailHtml);

          // Trigger in-app notification to referrer
          await createNotification({
            recipientId: referrerId,
            title: 'Referral Reward Earned! 🎁',
            message: `Your friend ${user.fullName || user.email} just purchased ${packageName}. You've earned ${rewardType === 'cash' ? `₹${rewardAmount} Cash` : `${rewardMonths} Months free subscription extension`}!`,
            type: 'reward',
            actionUrl: '/partner/referral'
          });
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
