import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/features/shared/model/user";
import ReferralSetting from "@/features/shared/model/referral-setting";
import ReferralReward from "@/features/shared/model/referral-reward";
import Client from "@/features/shared/model/client";
import Invoice, { IInvoice } from "@/features/shared/model/invoice";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    await connectDB();

    const purchases: IInvoice[] = await Invoice.find({ client_id: clientId }).sort({ purchase_date: -1 }).lean();

    return NextResponse.json({ success: true, purchases });
  } catch (error: unknown) {
    console.error("Fetch Purchases Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch purchases";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { client_id, service_name, amount, override_commission, reward_type } = body;

    if (!client_id || !service_name || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const client = await Client.findById(client_id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = await ReferralSetting.create({});
    }

    // Find who referred this client directly from the client model
    const referrerId = client.referredBy?.referrerId || null;
    let commission_amount = 0;
    let commission_calculated = false;

    if (referrerId) {
      commission_calculated = true;
      // Calculate commission based on selected reward type (either from override or default)
      const type = reward_type || settings.default_reward_type || 'percentage';
      
      if (type === 'percentage') {
        const percentage = override_commission !== undefined ? override_commission : (settings.commission_percentage || 10);
        commission_amount = amount * (percentage / 100);
      } else {
        // fixed cash logic based on high/low threshold
        if (amount >= settings.min_purchase_for_reward) {
          commission_amount = override_commission !== undefined ? override_commission : settings.cash_reward_high;
        } else {
          commission_amount = override_commission !== undefined ? override_commission : settings.cash_reward_low;
        }
      }

      // Record reward to referrer
      if (commission_amount > 0) {
        let rewardRecord = await ReferralReward.findOne({ customer_id: referrerId });
        if (!rewardRecord) {
          rewardRecord = await ReferralReward.create({
            customer_id: referrerId,
            total_earned: 0,
            cash_earned: 0,
            subscription_months: 0,
            pending_cash: 0
          });
        }

        if (settings.auto_credit_cash) {
          rewardRecord.total_earned += commission_amount;
          rewardRecord.cash_earned += commission_amount;
          await User.findByIdAndUpdate(referrerId, { $inc: { accountBalance: commission_amount } });
        } else {
          rewardRecord.pending_cash += commission_amount;
        }
        await rewardRecord.save();
      }
    }

    // Generate sequential invoice number (INV-YYYY-MM-DD-XXXX)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `INV-${year}-${month}-${day}-`;

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Invoice.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    const invoice_number = `${datePrefix}${String(count + 1).padStart(4, '0')}`;

    const newInvoice = await Invoice.create({
      client_id,
      invoice_number,
      items: [{
        service_name,
        amount,
        quantity: 1
      }],
      amount,
      referrer_id: referrerId || undefined,
      commission_amount,
      commission_calculated,
      status: 'paid'
    });

    return NextResponse.json({ success: true, purchase: newInvoice });
  } catch (error: unknown) {
    console.error("Add Purchase Error:", error);
    const message = error instanceof Error ? error.message : "Failed to add purchase";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
