import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/features/shared/model/user";
import ReferralCode from "@/features/shared/model/referral-code";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, phone, email, linkName, userId } = await req.json();

    if (!linkName) {
      return NextResponse.json({ error: "Referral link name is required" }, { status: 400 });
    }

    await connectDB();

    let targetUserId = userId;
    
    // If no userId provided, it means we're creating a new user for this link
    if (!targetUserId) {
      if (!name || !phone) {
        return NextResponse.json({ error: "Name and Phone are required to create a new user" }, { status: 400 });
      }

      // Check if user already exists with phone or email
      const query: Record<string, string>[] = [{ phone }];
      if (email) query.push({ email });

      const existingUser = await User.findOne({ $or: query });
      if (existingUser) {
        targetUserId = existingUser._id;
      } else {
        // Create new user, source: admin
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        // Temporary default password for newly created leads
        const defaultPassword = Math.random().toString(36).slice(-8) + "Aa1!";

        const newUser = await User.create({
          firstName,
          lastName,
          phone,
          email: email || `${phone}@temp.spentsmart.in`,
          password: defaultPassword,
          role: 'referral_partner',
          status: "active",
          emailVerified: false,
        });

        targetUserId = newUser._id;
      }
    }

    // Check how many links the user currently has
    const linkCount = await ReferralCode.countDocuments({ referrer_id: targetUserId });
    if (linkCount >= 5) {
      return NextResponse.json({ error: "User has reached the maximum limit of 5 referral links." }, { status: 400 });
    }

    // Generate random code suffix
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codeStr = 'REF';
    for (let i = 0; i < 5; i++) {
      codeStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCode = await ReferralCode.create({
      code: codeStr,
      name: linkName,
      referrer_id: targetUserId,
      is_active: true
    });

    return NextResponse.json({ success: true, referralCode: newCode });

  } catch (error: unknown) {
    console.error("Generate Referral Link Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate referral link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
