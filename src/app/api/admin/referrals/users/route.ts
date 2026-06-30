import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/features/shared/model/user";
import ReferralConversion from "@/features/shared/model/referral-conversion";
import ReferralReward from "@/features/shared/model/referral-reward";
import Invoice from "@/features/shared/model/invoice";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    // Fetch only users with role "referral_partner" (excluding soft deleted)
    const users = await User.find({ isDeleted: { $ne: true }, role: "referral_partner" })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch aggregates for all users
    const userIds = users.map(u => u._id);

    // Purchase value: what this user has purchased (if they were referred, we check conversions where they are prospect)
    // Wait, purchase is the value of purchases the client themselves made. We can check their subscriptions or conversion as prospect.
    // Sale: value of purchases made by people this user referred. (Conversion where they are referrer)
    // Commission: earned commission. (ReferralReward where they are customer)

    const salesAgg = await ReferralConversion.aggregate([
      { $match: { referrer_id: { $in: userIds }, conversion_stage: "purchased" } },
      { 
        $group: { 
          _id: "$referrer_id", 
          totalSale: { $sum: "$purchase_details.net_amount" } 
        } 
      }
    ]);

    const clientSalesAgg = await Invoice.aggregate([
      { $match: { referrer_id: { $in: userIds } } },
      {
        $group: {
          _id: "$referrer_id",
          totalSale: { $sum: "$amount" }
        }
      }
    ]);

    const purchasesAgg = await ReferralConversion.aggregate([
      { $match: { prospect_id: { $in: userIds }, conversion_stage: "purchased" } },
      { 
        $group: { 
          _id: "$prospect_id", 
          totalPurchase: { $sum: "$purchase_details.net_amount" } 
        } 
      }
    ]);

    const clientPurchasesAgg = await Invoice.aggregate([
      { $match: { client_id: { $in: userIds } } },
      {
        $group: {
          _id: "$client_id",
          totalPurchase: { $sum: "$amount" }
        }
      }
    ]);

    const rewards = await ReferralReward.find({ customer_id: { $in: userIds } }).lean();

    const formattedUsers = users.map(user => {
      const userSales1 = salesAgg.find(s => s._id.toString() === user._id.toString())?.totalSale || 0;
      const userSales2 = clientSalesAgg.find(s => s._id.toString() === user._id.toString())?.totalSale || 0;
      const userSales = userSales1 + userSales2;

      const userPurchases1 = purchasesAgg.find(p => p._id.toString() === user._id.toString())?.totalPurchase || 0;
      const userPurchases2 = clientPurchasesAgg.find(p => p._id.toString() === user._id.toString())?.totalPurchase || 0;
      const userPurchases = userPurchases1 + userPurchases2;
      const userReward = rewards.find(r => r.customer_id.toString() === user._id.toString());
      
      return {
        _id: user._id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
        email: user.email,
        phone: user.phone || "N/A",
        role: user.role,
        purchase: userPurchases,
        sale: userSales,
        commission: userReward?.total_earned || 0,
        cashEarned: userReward?.cash_earned || 0,
        createdAt: (user as { createdAt?: string | Date }).createdAt,
        status: user.status
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error: unknown) {
    console.error("Fetch Referral Users Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
