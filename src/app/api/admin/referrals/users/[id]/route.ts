import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/features/shared/model/user";
import ReferralCode from "@/features/shared/model/referral-code";
import ReferralConversion from "@/features/shared/model/referral-conversion";
import ReferralReward from "@/features/shared/model/referral-reward";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const userId = (await params).id;

    const user = await User.findById(userId).lean();
    if (!user || user.isDeleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const referralCodes = await ReferralCode.find({ referrer_id: userId }).lean();
    
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
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      stats: {
        sale: salesAgg[0]?.totalSale || 0,
        purchase: purchasesAgg[0]?.totalPurchase || 0,
        commission: reward?.total_earned || 0,
        cashEarned: reward?.cash_earned || 0,
      },
      referralCodes
    };

    return NextResponse.json(profileData);
  } catch (error: unknown) {
    console.error("Fetch User Profile Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const userId = (await params).id;

    const user = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User soft deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete User Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const userId = (await params).id;
    const body = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.firstName !== undefined) user.firstName = body.firstName;
    if (body.lastName !== undefined) user.lastName = body.lastName;
    if (body.email !== undefined) user.email = body.email.toLowerCase().trim();
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.status !== undefined) user.status = body.status;
    if (body.emailVerified !== undefined) user.emailVerified = body.emailVerified;
    if (body.password) {
      user.password = body.password;
    }

    await user.save();

    return NextResponse.json({ success: true, user: user.sanitize() });
  } catch (error: unknown) {
    console.error("Update User Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

