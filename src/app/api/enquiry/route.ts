import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/features/shared/model/client';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import User from '@/features/shared/model/user';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Input validation schema
const enquiryInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100),
  mobile: z.string().trim().min(7, 'Mobile number must be at least 7 digits.').max(15),
  email: z.string().trim().email('Please provide a valid email address.').max(255).optional().or(z.literal('')),
  subscription: z.string().trim().max(100).optional().or(z.literal('')),
  message: z.string().trim().max(500).optional().or(z.literal('')),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = enquiryInputSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((err: { message: string }) => err.message).join(' ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, mobile, email, subscription, message } = parseResult.data;

    await connectDB();

    const cleanPhone = mobile.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    // Check if this client already submitted a form (by mobile or email)
    const queryConditions: Array<{ mobile: string } | { email: string }> = [{ mobile: cleanPhone }];
    if (cleanEmail) queryConditions.push({ email: cleanEmail });
    const existingClient = await Client.findOne({ $or: queryConditions });

    // Check referral cookie
    let appliedCode = '';
    let referredByObj = undefined;

    try {
      const cookieStore = await cookies();
      const cookieRef = cookieStore.get('referral_code')?.value;
      if (cookieRef) {
        appliedCode = cookieRef.trim().toUpperCase();
        const validCodeDoc = await ReferralCode.findOne({
          code: appliedCode,
          is_active: true,
          $or: [{ expires_at: { $exists: false } }, { expires_at: { $gt: new Date() } }],
        });
        if (validCodeDoc) {
          const referrerUser = await User.findById(validCodeDoc.referrer_id);
          if (referrerUser) {
            referredByObj = {
              referrerId: referrerUser._id,
              referrerEmail: referrerUser.email,
            };
          }
        }
      }
    } catch (cookieErr) {
      console.warn('Could not read referral cookie during enquiry submission:', cookieErr);
    }

    // Save into Client collection — create or update
    let client;
    if (existingClient) {
      // Update existing client with latest enquiry info
      existingClient.subscription = subscription || existingClient.subscription;
      existingClient.message = message || existingClient.message;
      if (!existingClient.referralCode && appliedCode) {
        existingClient.referralCode = appliedCode;
        existingClient.referredBy = referredByObj;
        existingClient.source = 'referral';
      }
      await existingClient.save();
      client = existingClient;
    } else {
      client = await Client.create({
        name,
        mobile: cleanPhone,
        email: cleanEmail || undefined,
        subscription: subscription || undefined,
        message: message || undefined,
        status: 'pending',
        referralCode: appliedCode || undefined,
        referredBy: referredByObj,
        source: referredByObj ? 'referral' : 'website_enquiry',
      });
    }

    // Log referral conversion stage "enquired"
    if (appliedCode && referredByObj) {
      try {
        const ipHeader = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const clientIp = ipHeader.split(',')[0].trim();

        let conversion = await ReferralConversion.findOne({
          referral_code: appliedCode,
          prospect_email: cleanEmail || undefined,
        });

        if (!conversion) {
          conversion = await ReferralConversion.findOne({
            referral_code: appliedCode,
            conversion_stage: 'clicked',
            prospect_id: { $exists: false },
          }).sort({ createdAt: -1 });
        }

        if (conversion) {
          if (cleanEmail) conversion.prospect_email = cleanEmail;
          conversion.conversion_stage = 'enquired';
          conversion.timeline.visited_at = new Date();
          await conversion.save();
        } else {
          await ReferralConversion.create({
            referral_code: appliedCode,
            referrer_id: referredByObj.referrerId,
            prospect_email: cleanEmail || undefined,
            conversion_stage: 'enquired',
            timeline: { clicked_at: new Date(), visited_at: new Date() },
            metadata: {
              ip_address: clientIp,
              user_agent: req.headers.get('user-agent') || 'unknown',
            },
          });
        }
      } catch (convErr) {
        console.error('Error logging referral conversion during enquiry:', convErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Enquiry submitted successfully.',
        clientId: client._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enquiry submission error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
