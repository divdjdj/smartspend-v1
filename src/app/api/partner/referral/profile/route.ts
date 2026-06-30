import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/features/shared/model/user";
import ReferralConversion from "@/features/shared/model/referral-conversion";
import ReferralReward from "@/features/shared/model/referral-reward";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).populate("referredBy.referrerId", "firstName lastName email").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Aggregates for profile
    const salesAgg = await ReferralConversion.aggregate([
      { $match: { referrer_id: user._id, conversion_stage: "purchased" } },
      { $group: { _id: null, totalSale: { $sum: "$purchase_details.net_amount" } } }
    ]);

    const purchasesAgg = await ReferralConversion.aggregate([
      { $match: { prospect_id: user._id, conversion_stage: "purchased" } },
      { $group: { _id: null, totalPurchase: { $sum: "$purchase_details.net_amount" } } }
    ]);

    const reward = await ReferralReward.findOne({ customer_id: user._id }).lean();

    const profileData = {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      stats: {
        sale: salesAgg[0]?.totalSale || 0,
        purchase: purchasesAgg[0]?.totalPurchase || 0,
        commission: reward?.total_earned || 0,
        cashEarned: reward?.cash_earned || 0,
      }
    };

    return NextResponse.json(profileData);
  } catch (error: unknown) {
    console.error("Fetch Customer Profile Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
